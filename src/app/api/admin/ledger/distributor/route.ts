import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { z } from 'zod'

import { connect } from '@/configs/dbconfig'
import { sendEmail } from '@/helpers/mailer'

import ReceivedPaymentModel from '@/models/receivedPayment.model'
import InvoiceModal from '@/models/invoice.model'
import InvoiceItem from '@/models/invoiceItem.model'
import ClaimModel from '@/models/claims.model'
import ClaimItemModel from '@/models/claimItem.model'
import AdjustmentsModal from '@/models/adjustment.model'
import DistributorsModel from '@/models/distributors.model'
import { createDistributorCsv } from '@/helpers/csv-distributor-ledger'

connect()

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json()
    const { startDate, endDate, fileType, email, id } = reqBody

    const schema = z.object({
      startDate: z.string(),
      endDate: z.string(),
      fileType: z.enum(['csv', 'pdf']),
      email: z.string().email(),
      id: z.string()
    })

    const validationRules = schema.safeParse(reqBody)

    if (!validationRules.success) {
      const { errors } = validationRules.error

      return NextResponse.json({ error: { message: 'Invalid request', errors } }, { status: 400 })
    }

    const distributor = await DistributorsModel.findById(id)

    const query = {
      sort: { createdAt: -1 }
    }

    let invoices: any = []
    let claims: any = []
    let adjustments: any = []
    let receivedPayments: any = []

    const filter: any = { distributor: id }

    if (startDate && endDate) {
      const start = new Date(new Date(startDate).setHours(0, 0, 0, 0)).toISOString()
      const end = new Date(new Date(endDate).setHours(23, 59, 59, 999)).toISOString()

      filter.createdAt = {
        $gte: start,
        $lte: end
      }
    }

    invoices = await InvoiceModal.find(filter, {}, query)
    adjustments = await AdjustmentsModal.find(filter, {}, query)
    receivedPayments = await ReceivedPaymentModel.find(filter, {}, query)
    claims = await ClaimModel.find(filter, {}, query)

    const receivedPaymentsWithType = await Promise.all(
      receivedPayments?.map(async (receivedPayment: any) => {
        return { ...receivedPayment?.toObject(), type: 'Received Payment' }
      })
    )

    const adjustmentsWithType = await Promise.all(
      adjustments?.map(async (adjustment: any) => {
        return { ...adjustment?.toObject(), type: 'Adjustment' }
      })
    )

    const claimsWithTotalItem = await Promise.all(
      claims.map(async (claim: any) => {
        const claimItems = await ClaimItemModel.find({ claim_id: claim._id })

        const totalItems = claimItems?.reduce((acc, item) => acc + item?.qty, 0)

        return { ...claim?.toObject(), total_items: totalItems || 0, type: 'Claim' }
      })
    )

    const invoicesWithTotalItem = await Promise.all(
      invoices?.map(async (invoice: any) => {
        const totalItems = await InvoiceItem.findOne({ invoice_id: invoice._id })

        return { ...invoice?.toObject(), total_items: totalItems?.qty, type: 'Invoice' } // Add totalQty to the product object
      })
    )

    const mergedData = [
      ...invoicesWithTotalItem,
      ...receivedPaymentsWithType,
      ...claimsWithTotalItem,
      ...adjustmentsWithType
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    if (fileType === 'pdf') {
      return NextResponse.json({ success: true, data: { distributor, mergedData, startDate, endDate } })
    } else if (fileType === 'csv') {
      const csvBytes = await createDistributorCsv({ mergedData })

      if (!csvBytes) {
        throw new Error('Failed to generate CSV bytes')
      }

      await sendEmail({ email, emailType: 'LEDGER', startDate, endDate, pdfBytes: csvBytes, fileType })
      return NextResponse.json({
        success: true,
        message: `Ledger report has been sent to ${email} successfully`
      })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
