import { NextResponse, type NextRequest } from 'next/server'

import { zfd } from 'zod-form-data'

import { connect } from '@/configs/dbconfig'
import AdjustmentModel from '@/models/adjustment.model'
import DistributorsModel from '@/models/distributors.model'

connect()

export async function POST(request: NextRequest) {
  try {
    const reqFormData = await request.formData()
    const adjustmentId = reqFormData.get('adjustmentId')
    const distributor = reqFormData.get('distributor')
    const amount = reqFormData.get('amount')
    const note = reqFormData.get('note')

    const schema = zfd.formData({
      adjustmentId: zfd.text(),
      distributor: zfd.text(),
      amount: zfd.text(),
      note: zfd.text().optional()
    })

    const validationRules = schema.safeParse(reqFormData)

    if (!validationRules.success) {
      const { errors } = validationRules.error

      return NextResponse.json(
        {
          error: { message: 'Invalid request', errors }
        },
        { status: 400 }
      )
    }

    // Check if adjustment exists
    const adjustment = await AdjustmentModel.findById(adjustmentId)
    const isDistributor = await DistributorsModel.findById(distributor)

    if (!adjustment) {
      return NextResponse.json({ error: 'Adjustment does not exist' }, { status: 400 })
    }

    if (!isDistributor) {
      return NextResponse.json({ error: 'Distributor does not exist' }, { status: 400 })
    }

    if (adjustment.distributor.toString() !== distributor) {
      if (
        !isDistributor?.claimed_amount ||
        isDistributor?.claimed_amount < Number(amount) ||
        !isDistributor?.to_received ||
        isDistributor?.to_received < Number(amount)
      ) {
        return NextResponse.json(
          { error: 'Insufficient claimed or received amount for the selected distributor.' },
          { status: 400 }
        )
      }

      await DistributorsModel.updateOne(
        { _id: adjustment.distributor },
        {
          $inc: { claimed_amount: adjustment.amount, to_received: adjustment.amount }
        }
      )

      await DistributorsModel.updateOne(
        { _id: distributor },
        {
          $inc: { claimed_amount: -Number(amount), to_received: -Number(amount) }
        }
      )
    } else {
      const totalClaimedAmount = Number(isDistributor?.claimed_amount) + adjustment.amount
      const totalReceivedAmount = Number(isDistributor?.to_received) + adjustment.amount

      if (
        !totalClaimedAmount ||
        totalClaimedAmount < Number(amount) ||
        !totalReceivedAmount ||
        totalReceivedAmount < Number(amount)
      ) {
        return NextResponse.json(
          { error: 'Insufficient claimed or received amount for the selected distributor.' },
          { status: 400 }
        )
      }

      const updated_amount = adjustment.amount - Number(amount)

      await DistributorsModel.updateOne(
        { _id: distributor },
        { $inc: { claimed_amount: updated_amount, to_received: updated_amount } }
      )
    }

    // Create an object to store the fields that need to be updated
    const updates: any = {
      distributor: adjustment.distributor,
      amount: adjustment.amount,
      note: adjustment.note
    }

    if (distributor) {
      updates.distributor = distributor
    }

    if (amount) {
      updates.amount = amount
    }

    if (note) {
      updates.note = note
    }

    // Update adjustment
    const updated = await AdjustmentModel.updateOne({ _id: adjustmentId }, { $set: updates })

    if (updated) {
      const adjustments = await AdjustmentModel.findById(adjustmentId).populate('distributor')

      return NextResponse.json({
        success: true,
        adjustments
      })
    } else {
      return NextResponse.json({ error: 'Something went wrong' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
