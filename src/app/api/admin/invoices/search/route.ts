import { NextResponse, type NextRequest } from 'next/server'

import { connect } from '@/configs/dbconfig'

import InvoiceModel from '@/models/invoice.model'
import DistributorsModel from '@/models/distributors.model'

import type { Distributor } from '@/types/distributor'

connect()

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get('search')

  try {
    // Find the vendor based on the name
    const distributors = await DistributorsModel.find({
      name: { $regex: search, $options: 'i' }
    })

    if (!distributors) {
      return NextResponse.json({
        success: true,
        invoices: []
      })
    }

    // Use Promise.all to wait for all invoices to be fetched
    const invoicesPromises = distributors.map(async (distributor: Distributor) => {
      const distributorInvoices = await InvoiceModel.find({ distributor: distributor._id }).populate('distributor')

      return distributorInvoices
    })

    const invoices = await Promise.all(invoicesPromises)

    // Flatten the nested array structure
    const flattenedInvoices = await invoices.flatMap((item: any) => item)

    return NextResponse.json({
      success: true,
      invoices: flattenedInvoices
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
