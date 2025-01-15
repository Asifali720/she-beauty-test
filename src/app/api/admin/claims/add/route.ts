import { NextResponse, type NextRequest } from 'next/server'

import { z } from 'zod'

import { connect } from '@/configs/dbconfig'

import ClaimModel from '@/models/claims.model'
import ClaimItemModel from '@/models/claimItem.model'
import ProductModel from '@/models/product.model'
import DistributorsModel from '@/models/distributors.model'

connect()

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json()
    const { distributor, products, total_cost, claimed_at, note } = reqBody

    const schema = z.object({
      distributor: z.string(),
      total_cost: z.number(),
      claimed_at: z.string(),
      note: z.string().optional(),
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

    const isDistributor = await DistributorsModel.findById(distributor)

    if (!isDistributor) {
      return NextResponse.json({ error: 'Distributor does not exist' }, { status: 400 })
    }

    const newClaim = new ClaimModel({
      distributor
    })

    const savedClaim = await newClaim.save()

    const newItems = await isValidProduct(products, savedClaim._id)

    await ClaimModel.updateOne({ _id: savedClaim._id }, { $set: { total_cost, claimed_at, note } })
    await DistributorsModel.updateOne({ _id: distributor }, { $inc: { claimed_amount: total_cost } })
    await ClaimItemModel.insertMany(newItems)

    const claim = await ClaimModel.findById(savedClaim._id).populate('distributor')

    return NextResponse.json({
      success: true,
      claim
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

const isValidProduct = async (products: any, claimId: any) => {
  try {
    const checkedProducts = await Promise.all(
      products?.map(async (item: any) => {
        const product = await ProductModel.findOne({ sku: item.sku })

        if (!product) {
          throw new Error(`Product with sku ${item.sku} not exists`)
        }

        return { claim_id: claimId, product: product._id, qty: item.qty, cost: item.cost } // Return resolved value
      })
    )

    return checkedProducts // Return the array of valid product IDs
  } catch (error) {
    throw error // Re-throw to propagate the error to the caller
  }
}
