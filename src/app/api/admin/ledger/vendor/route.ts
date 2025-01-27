import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { z } from 'zod'

import { connect } from '@/configs/dbconfig'
import { sendEmail } from '@/helpers/mailer'

import BillModel from '@/models/bill.model'
import BillItemModel from '@/models/billItem.model'
import PaidPaymentModel from '@/models/paidPayment.model'
import VendorsModel from '@/models/vendor.model'
import { createVendorCsv } from '@/helpers/csv-vendor-ledger'

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

    const vendor = await VendorsModel.findById(id)

    const query = {
      sort: { createdAt: -1 }
    }

    let bills: any = []
    let paidPayments: any = []

    const filter: any = { vendor: vendor?._id } // Filtering by vendor ID

    if (startDate && endDate) {
      const start = new Date(new Date(startDate).setHours(0, 0, 0, 0)).toISOString()
      const end = new Date(new Date(endDate).setHours(23, 59, 59, 999)).toISOString()

      filter.createdAt = {
        $gte: start,
        $lte: end
      }
    }

    // Fetch bills and paidPayments associated with the vendor ID
    bills = await BillModel.find(filter, {}, query)

    paidPayments = await PaidPaymentModel.find(filter, {}, query)

    const billsWithTotalItem = await Promise.all(
      bills.map(async (bill: any) => {
        const raw_items = await BillItemModel.find({ bill_id: bill._id }).populate('raw_item')

        const totalRawItems = raw_items?.reduce((acc, item) => acc + item?.qty, 0)

        return { ...bill?.toObject(), total_items: totalRawItems || 0 }
      })
    )

    const mergedData = [...billsWithTotalItem, ...paidPayments].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    if (fileType === 'pdf') {
      return NextResponse.json({ success: true, data: { vendor, mergedData, startDate, endDate } })
    } else if (fileType === 'csv') {
      const csvBytes = await createVendorCsv({ mergedData })

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
