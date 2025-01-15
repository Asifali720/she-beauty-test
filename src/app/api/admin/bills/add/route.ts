import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { zfd } from 'zod-form-data'

import { connect } from '@/configs/dbconfig'
import { uploadImageFile } from '@/helpers/upload-image'

import BillModel from '@/models/bill.model'
import BillItemModel from '@/models/billItem.model'
import RawItemsModel from '@/models/rawitem.model'
import VendorsModel from '@/models/vendor.model'
import IngredientsModel from '@/models/ingredients.model'
import BillIngredientModal from '@/models/billIngredient.model'

connect()

export async function POST(request: NextRequest) {
  try {
    const reqFormData = await request.formData()

    const vendor = reqFormData.get('vendor')
    const bill_image = reqFormData.get('bill_image')
    const rawItems = reqFormData.get('rawItems')
    const ingredients = reqFormData.get('ingredients')
    const totalCost = reqFormData.get('totalCost')
    const bill_date = reqFormData.get('bill_date')

    const schema = zfd.formData({
      vendor: zfd.text(),
      rawItems: zfd.text(),
      bill_image: zfd.file(),
      ingredients: zfd.text(),
      totalCost: zfd.text(),
      bill_date: zfd.text()
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

    const isVendor = await VendorsModel.findById(vendor)

    if (!isVendor) {
      return NextResponse.json({ error: 'Vendor does not exist' }, { status: 400 })
    }

    const photoUrl = await uploadImageFile(bill_image!)

    const newBill = new BillModel({
      vendor,
      bill_image: photoUrl,
      bill_date,
      status: 'approved'
    })

    const newItems = await isValidRawItem(rawItems)
    const newIngredients = await isValidIngredient(ingredients)

    const savedBill = await newBill.save()

    const updatedRawItems = await newItems?.map((item: any) => ({
      ...item,
      bill_id: savedBill?._id
    }))

    const updatedIngredients = await newIngredients?.map((item: any) => ({
      ...item,
      bill_id: savedBill?._id
    }))

    // const totalCost = await getTotalCost(rawItems, ingredients)

    await VendorsModel.updateOne({ _id: vendor }, { $inc: { balance_amount: Number(totalCost) } })
    await BillModel.updateOne({ _id: savedBill._id }, { $set: { bill_amount: Number(totalCost) } })
    await BillItemModel.insertMany(updatedRawItems)
    await BillIngredientModal.insertMany(updatedIngredients)

    const bill = await BillModel.findById(savedBill._id)

    return NextResponse.json({
      success: true,
      bill
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

const isValidRawItem = async (rawItems: any) => {
  const parsedRawItems = await JSON.parse(rawItems)

  try {
    const checkedRawItems = await Promise.all(
      parsedRawItems?.map(async (item: any) => {
        const rawItem = await RawItemsModel.findOne({ sku: item.sku })

        if (!rawItem) {
          throw new Error(`Raw item with sku ${item.sku} not exists`)
        }

        const LowestCost = Math.min(rawItem.cost.lowest || item.cost, item.cost)
        const HighestCost = Math.max(rawItem.cost.highest || item.cost, item.cost)

        await RawItemsModel.updateOne(
          { _id: rawItem._id },
          {
            $inc: { quantity: item.qty },
            $set: {
              cost: {
                highest: HighestCost,
                lowest: LowestCost
              }
            }
          }
        )

        return { raw_item: rawItem._id, qty: item.qty, cost: item.cost } // Return resolved value
      })
    )

    return checkedRawItems // Return the array of valid product IDs
  } catch (error) {
    throw error // Re-throw to propagate the error to the caller
  }
}

const isValidIngredient = async (ingredients: any) => {
  const parsedIngredients = await JSON.parse(ingredients)

  try {
    const checkedIngredients = await Promise.all(
      parsedIngredients?.map(async (item: any) => {
        const ingredient = await IngredientsModel.findOne({ sku: item.sku })

        if (!ingredient) {
          throw new Error(`Ingredient with sku ${item.sku} not exists`)
        }

        const LowestCost = Math.min(ingredient.cost.lowest || item.cost, item.cost)
        const HighestCost = Math.max(ingredient.cost.highest || item.cost, item.cost)

        await IngredientsModel.updateOne(
          { _id: ingredient._id },
          {
            $inc: { quantity: item.qty },
            $set: {
              cost: {
                highest: HighestCost,
                lowest: LowestCost
              }
            }
          }
        )

        return { ingredient: ingredient._id, qty: item.qty, cost: item.cost } // Return resolved value
      })
    )

    return checkedIngredients // Return the array of valid product IDs
  } catch (error) {
    throw error // Re-throw to propagate the error to the caller
  }
}
