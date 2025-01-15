import { NextResponse, type NextRequest } from 'next/server'

import { connect } from '@/configs/dbconfig'

import ReceivedPaymentsModel from '@/models/receivedPayment.model'
import DistributorsModel from '@/models/distributors.model'

connect()

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get('search')

  try {
    const distributors = await DistributorsModel.find({
      name: { $regex: search, $options: 'i' }
    })

    if (!distributors) {
      return NextResponse.json({
        success: true,
        receivedPayments: []
      })
    }

    // Use Promise.all to wait for all invoices to be fetched
    const receivedPaymentsPromises = distributors.map(async (distributor: any) => {
      const distributorPayments = await ReceivedPaymentsModel.find({ distributor: distributor._id }).populate(
        'distributor'
      )

      return distributorPayments
    })

    const receivedPayments = await Promise.all(receivedPaymentsPromises)

    // Flatten the nested array structure
    const flattenedReceivedPayments = await receivedPayments.flatMap((item: any) => item)

    return NextResponse.json({
      success: true,
      receivedPayments: flattenedReceivedPayments
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
