import { NextResponse, type NextRequest } from 'next/server'

import { connect } from '@/configs/dbconfig'

import PaidPaymentsModel from '@/models/paidPayment.model'
import VendorsModel from '@/models/vendor.model'

connect()

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get('search')

  try {
    const vendors = await VendorsModel.find({
      name: { $regex: search, $options: 'i' }
    })

    if (!vendors) {
      return NextResponse.json({
        success: true,
        paidPayments: []
      })
    }

    // Use Promise.all to wait for all invoices to be fetched
    const paidPaymentsPromises = vendors.map(async (vendor: any) => {
      const vendorPayments = await PaidPaymentsModel.find({ vendor: vendor._id }).populate('vendor')

      return vendorPayments
    })

    const paidPayments = await Promise.all(paidPaymentsPromises)

    // Flatten the nested array structure
    const flattenedPaidPayments = await paidPayments.flatMap((item: any) => item)

    return NextResponse.json({
      success: true,
      paidPayments: flattenedPaidPayments
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
