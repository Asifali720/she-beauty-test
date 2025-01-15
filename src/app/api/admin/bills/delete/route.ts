import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { z } from 'zod'

import { connect } from '@/configs/dbconfig'

import BillModel from '@/models/bill.model'
import BillItemModel from '@/models/billItem.model'
import BillIngredient from '@/models/billIngredient.model'
import IngredientsModel from '@/models/ingredients.model'
import RawItemsModel from '@/models/rawitem.model'
import VendorsModel from '@/models/vendor.model'

connect()

export async function POST(request: NextRequest) {
  try {
    const bill_id = request.nextUrl.searchParams.get('bill_id')

    const schema = z.object({
      bill_id: z.string()
    })

    const validationRules = schema.safeParse({ bill_id: request.nextUrl.searchParams.get('bill_id') })

    if (!validationRules.success) {
      const { errors } = validationRules.error

      return NextResponse.json(
        {
          error: { message: 'Invalid request', errors }
        },
        { status: 400 }
      )
    }

    const bill = await BillModel.findById(bill_id)

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 })
    }

    const vendor_balance = await VendorsModel.updateOne(
      { _id: bill.vendor },
      { $inc: { balance_amount: -bill.bill_amount } }
    )

    const billItems = await BillItemModel.find({ bill_id })
    const billIngredients = await BillIngredient.find({ bill_id })

    await updateItems(billItems)
    await updateIngredient(billIngredients)

    const billItemsDeleted = await BillItemModel.deleteMany({ bill_id })
    const billIngredientsDeleted = await BillIngredient.deleteMany({ bill_id })

    await updateItemsCost(billItems)
    await updateIngredientCost(billIngredients)

    const billDeleted = await BillModel.findByIdAndDelete(bill_id)

    if (vendor_balance?.acknowledged && billDeleted && billItemsDeleted && billIngredientsDeleted) {
      return NextResponse.json({
        success: true,
        message: 'Bill deleted successflly'
      })
    } else {
      return NextResponse.json({ error: 'Something went wrong' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

const updateItems = async (billItem: any) => {
  const billItems = billItem.map(async (item: any) => {
    const rawItem = await RawItemsModel.findById(item?.raw_item)

    if (rawItem) {
      await RawItemsModel.updateOne(
        { _id: rawItem._id },
        {
          $inc: { quantity: -item?.qty }
        }
      )
    }
  })

  await Promise.all(billItems)
}

const updateItemsCost = async (billItem: any) => {
  const billItems = billItem.map(async (item: any) => {
    const rawItem = await RawItemsModel.findById(item?.raw_item)

    const lowestCost = await BillItemModel.find({ raw_item: rawItem._id }).sort({ cost: 1 }).limit(1)
    const highestCost = await BillItemModel.find({ raw_item: rawItem._id }).sort({ cost: -1 }).limit(1)

    if (rawItem) {
      await RawItemsModel.updateOne(
        { _id: rawItem._id },
        {
          $set: {
            cost: {
              highest: highestCost?.[0]?.cost || 0,
              lowest: lowestCost?.[0]?.cost || 0
            }
          }
        }
      )
    }
  })

  await Promise.all(billItems)
}

const updateIngredient = async (billIngredient: any) => {
  const billIngredients = billIngredient.map(async (item: any) => {
    const ingredient = await IngredientsModel.findById(item?.ingredient)

    if (ingredient) {
      await IngredientsModel.updateOne(
        { _id: ingredient._id },
        {
          $inc: { quantity: -item?.qty }
        }
      )
    }
  })

  await Promise.all(billIngredients)
}

const updateIngredientCost = async (billIngredient: any) => {
  const billIngredients = billIngredient.map(async (item: any) => {
    const ingredient = await IngredientsModel.findById(item?.ingredient)

    const lowestCost = await BillIngredient.find({ ingredient: ingredient?._id }).sort({ cost: 1 }).limit(1)

    const highestCost = await BillIngredient.find({ ingredient: ingredient?._id }).sort({ cost: -1 }).limit(1)

    if (ingredient) {
      await IngredientsModel.updateOne(
        { _id: ingredient._id },
        {
          $set: {
            cost: {
              highest: highestCost?.[0]?.cost || 0,
              lowest: lowestCost?.[0]?.cost || 0
            }
          }
        }
      )
    }
  })

  await Promise.all(billIngredients)
}
