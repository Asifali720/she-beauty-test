import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { connect } from '@/configs/dbconfig'

import BillModel from '@/models/bill.model'
import VendorModel from '@/models/vendor.model'

import type { Vendor } from '@/types/vendor'

connect()

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get('search')

  try {
    // Find the vendor based on the name
    const vendors = await VendorModel.find({
      name: { $regex: search, $options: 'i' }
    })

    if (!vendors) {
      return NextResponse.json({
        success: true,
        bills: []
      })
    }

    // Use Promise.all to wait for all bills to be fetched
    const billsPromises = vendors.map(async (vendor: Vendor) => {
      const vendorBills = await BillModel.find({ vendor: vendor._id }).populate('vendor')

      return vendorBills
    })

    const bills = await Promise.all(billsPromises)

    // Flatten the nested array structure
    const flattenedBills = await bills.flatMap((item: any) => item)

    return NextResponse.json({
      success: true,
      bills: flattenedBills
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
