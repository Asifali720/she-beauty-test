import { NextResponse, type NextRequest } from 'next/server'

import { z } from 'zod'

import { connect } from '@/configs/dbconfig'

import ClaimModel from '@/models/claims.model'
import DistributorsModel from '@/models/distributors.model'
import ProductModel from '@/models/product.model'
import ClaimItemModel from '@/models/claimItem.model'

connect()

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json()
    const { claimId, distributor, products, total_cost, claimed_at, note } = reqBody

    const schema = z.object({
      claimId: z.string(),
      total_cost: z.number(),
      note: z.string().optional(),
      claimed_at: z.string(),
      distributor: z.string(),
      products: z.array(z.object({ sku: z.string(), qty: z.number(), cost: z.number() }))
    })

    const validationRules = schema.safeParse(reqBody)

    if (!validationRules.success) {
      const { errors } = validationRules.error

      return NextResponse.json(
        {
          error: { message: 'Invalid request', errors }
        },
        { status: 400 }
      )
    }

    //check if product exists
    const claim = await ClaimModel.findById(claimId)
    const isDistributor = await DistributorsModel.findById(distributor)

    if (!claim) {
      return NextResponse.json({ error: 'Claim does not exist' }, { status: 400 })
    }

    if (!isDistributor) {
      return NextResponse.json({ error: 'Distributor does not exist' }, { status: 400 })
    }

    // Create an object to store the fields that need to be updated
    const updates = {
      distributor: claim.distributor,
      total_cost: claim.total_cost,
      products: claim.products,
      claimed_at: claim?.claimed_at,
      note: note
    }

    if (distributor) {
      updates.distributor = distributor
    }

    if (products) {
      updates.products = products
    }

    if (claimed_at) {
      updates.claimed_at = claimed_at
    }

    if (total_cost) {
      updates.total_cost = total_cost
    }

    // Update distributor's claimed_amount if the distributor changes
    if (claim.distributor !== distributor) {
      await DistributorsModel.updateOne({ _id: claim.distributor }, { $inc: { claimed_amount: -claim.total_cost } })
      await DistributorsModel.updateOne({ _id: distributor }, { $inc: { claimed_amount: total_cost } })
    } else if (total_cost !== claim.total_cost) {
      const costDifference = total_cost - claim.total_cost

      await DistributorsModel.updateOne({ _id: distributor }, { $inc: { claimed_amount: costDifference } })
    }

    // update Claim
    const updated = await ClaimModel.updateOne({ _id: claimId }, { $set: updates })

    // update Claim items
    await updateItem(products, claimId)

    if (updated) {
      const claim = await ClaimModel.findById(claimId).populate('distributor')

      return NextResponse.json({
        success: true,
        claim
      })
    } else {
      return NextResponse.json({ error: 'Something went wrong' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

const updateItem = async (products: any, claimId: any) => {
  // Fetch all existing claim items for the given claimId
  const existingItems = await ClaimItemModel.find({ claim_id: claimId }).populate('product')

  const itemsToRemove = existingItems.filter((item: any) => {
    return !products.find((product: any) => product?.sku === item?.product?.sku)
  })

  if (itemsToRemove.length > 0) {
    const removeIds = itemsToRemove.map((item: any) => item?._id)

    await ClaimItemModel.deleteMany({ _id: { $in: removeIds } })
  }

  const updatePromises = products.map(async (update: any) => {
    const { sku, qty, cost } = update

    const product = await ProductModel.findOne({ sku })

    if (!product) {
      throw new Error(`Product with sku ${sku} not exists`)
    }

    const isClaimItem = await ClaimItemModel.findOne({
      claim_id: claimId,
      product: product?._id
    })

    if (!isClaimItem) {
      const newItems = new ClaimItemModel({
        claim_id: claimId,
        product: product?._id,
        qty,
        cost
      })

      await newItems.save()
    } else {
      const updateOperation = { $set: { sku, qty, cost } }

      return ClaimItemModel.updateOne({ _id: isClaimItem._id }, updateOperation)
    }
  })

  await Promise.all(updatePromises)
}
