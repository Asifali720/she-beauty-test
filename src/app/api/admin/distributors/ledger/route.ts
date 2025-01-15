import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { z } from 'zod'

import { connect } from '@/configs/dbconfig'

import ReceivedPaymentModel from '@/models/receivedPayment.model'
import InvoiceModal from '@/models/invoice.model'
import InvoiceItem from '@/models/invoiceItem.model'
import ClaimModel from '@/models/claims.model'
import ClaimItemModel from '@/models/claimItem.model'
import AdjustmentsModal from '@/models/adjustment.model'

connect()

export async function GET(request: NextRequest) {
  try {
    const pageNo = Number(request.nextUrl.searchParams.get('pageNo') || 1)
    const size = Number(request.nextUrl.searchParams.get('size') || 10)
    const startDate = request.nextUrl.searchParams.get('startDate')
    const endDate = request.nextUrl.searchParams.get('endDate')
    const id = request.nextUrl.searchParams.get('id')

    const schema = z.object({
      id: z.string()
    })

    const validationRules = schema.safeParse({ id })

    if (!validationRules.success) {
      const { errors } = validationRules.error

      return NextResponse.json(
        {
          error: { message: 'Invalid request', errors }
        },
        { status: 400 }
      )
    }

    const query = {
      skip: size * (pageNo - 1),
      limit: size,
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

    const totalCount = mergedData.length

    const totalPages = Math.ceil(totalCount / size)

    const to = size * pageNo
    const from = to - (size - 1)

    return NextResponse.json({
      success: true,
      totalPages,
      totalRows: totalCount,
      from,
      to: to > totalCount ? totalCount : to,
      distributorLegder: mergedData
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
