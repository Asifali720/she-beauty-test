import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { zfd } from 'zod-form-data'

import { connect } from '@/configs/dbconfig'
import { uploadImageFile } from '@/helpers/upload-image'

import Bill from '@/models/bill.model'
import BillItemModel from '@/models/billItem.model'
import Vendor from '@/models/vendor.model'
import RawItemsModel from '@/models/rawitem.model'
import IngredientsModel from '@/models/ingredients.model'
import BillIngredientModal from '@/models/billIngredient.model'

connect()

export async function POST(request: NextRequest) {
  try {
    const reqFormData = await request.formData()

    const billId = reqFormData.get('billId')
    const vendor = reqFormData.get('vendor')
    const bill_image = reqFormData.get('bill_image')
    const rawItems = reqFormData.get('rawItems')
    const ingredients = reqFormData.get('ingredients')
    const totalCost = reqFormData.get('totalCost')
    const bill_date = reqFormData.get('bill_date')

    const schema = zfd.formData({
      billId: zfd.text(),
      vendor: zfd.text(),
      rawItems: zfd.text(),
      bill_image: zfd.file().optional(),
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

    //check if product exists
    const bill = await Bill.findById(billId)
    const isVendor = await Vendor.findById(vendor)

    if (!bill) {
      return NextResponse.json({ error: 'bill does not exist' }, { status: 400 })
    }

    if (!isVendor) {
      return NextResponse.json({ error: 'Vendor does not exist' }, { status: 400 })
    }

    // Update vendor's balance_amount if the vendor changes
    if (bill.vendor !== isVendor) {
      await Vendor.updateOne({ _id: bill.vendor }, { $inc: { balance_amount: -bill.bill_amount } })
      await Vendor.updateOne({ _id: isVendor }, { $inc: { balance_amount: Number(totalCost) } })
    } else if (Number(totalCost) !== bill.bill_amount) {
      const costDifference = Number(totalCost) - bill.bill_amount

      await Vendor.updateOne({ _id: isVendor }, { $inc: { balance_amount: costDifference } })
    }

    // Create an object to store the fields that need to be updated
    const updates = {
      vendor: bill.vendor,
      status: bill.status,
      bill_amount: Number(totalCost),
      bill_image: bill.bill_image,
      bill_date: bill.bill_date
    }

    updates.status = 'approved'

    if (vendor) {
      updates.vendor = vendor
    }

    if (bill_image) {
      const photoUrl = await uploadImageFile(bill_image)

      updates.bill_image = photoUrl
    }

    if (bill_date) {
      updates.bill_date = bill_date
    }

    // update bill
    const updated = await Bill.updateOne({ _id: billId }, { $set: updates })

    // update bill items
    await updateItem(rawItems, billId)
    await updateIngredient(ingredients, billId)

    if (updated) {
      const bill = await Bill.findById(billId).populate('vendor')

      return NextResponse.json({
        success: true,
        bill
      })
    } else {
      return NextResponse.json({ error: 'Something went wrong' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

const updateItem = async (rawItems: any, billId: any) => {
  const parsedRawItems = JSON.parse(rawItems)
  const existingItems = await BillItemModel.find({ bill_id: billId }).populate('raw_item')

  // Identify items to be removed
  const itemsToRemove = existingItems.filter((item: any) => {
    return !parsedRawItems.find((raw_item: any) => raw_item?.sku === item?.raw_item?.sku)
  })

  if (itemsToRemove.length > 0) {
    const updatePromises = itemsToRemove.map(async (item: any) => {
      await RawItemsModel.updateOne({ _id: item?.raw_item?._id }, { $inc: { quantity: -item.qty } })

      await BillItemModel.findByIdAndDelete(item._id)

      const lowestCost = await BillItemModel.find({ raw_item: item?.raw_item?._id }).sort({ cost: 1 }).limit(1)
      const highestCost = await BillItemModel.find({ raw_item: item?.raw_item?._id }).sort({ cost: -1 }).limit(1)

      await RawItemsModel.updateOne(
        { _id: item?.raw_item?._id },
        {
          $set: {
            cost: {
              highest: highestCost?.[0]?.cost || 0,
              lowest: lowestCost?.[0]?.cost || 0
            }
          }
        }
      )
    })

    await Promise.all(updatePromises)
  }

  // Update or add new items
  const updatePromises = await parsedRawItems.map(async (update: any) => {
    const { sku, qty, cost } = update

    const rawItem = await RawItemsModel.findOne({ sku })

    if (!rawItem) {
      throw new Error(`Raw item with sku ${sku} not exists.`)
    }

    const isBillItem = await BillItemModel.findOne({
      bill_id: billId,
      raw_item: rawItem?._id
    })

    if (!isBillItem) {
      const newItems = new BillItemModel({
        bill_id: billId,
        sku,
        qty,
        cost,
        raw_item: rawItem?._id
      })

      await RawItemsModel.updateOne(
        { sku },
        {
          $inc: { quantity: qty }
        }
      )
      await newItems.save()
    } else {
      const qtyDifference = qty - isBillItem.qty

      await RawItemsModel.updateOne(
        { sku },
        {
          $inc: { quantity: qtyDifference }
        }
      )

      await BillItemModel.updateOne({ _id: isBillItem._id }, { $set: { qty, cost } })
    }

    const lowestCost = await BillItemModel.find({ raw_item: rawItem._id }).sort({ cost: 1 }).limit(1)
    const highestCost = await BillItemModel.find({ raw_item: rawItem._id }).sort({ cost: -1 }).limit(1)

    await RawItemsModel.updateOne(
      { sku },
      {
        $set: {
          cost: {
            highest: highestCost?.[0]?.cost || 0,
            lowest: lowestCost?.[0]?.cost || 0
          }
        }
      }
    )
  })

  await Promise.all(updatePromises)
}

const updateIngredient = async (ingredients: any, billId: any) => {
  const parsedIngredients = JSON.parse(ingredients)
  const existingIngredients = await BillIngredientModal.find({ bill_id: billId }).populate('ingredient')

  // Identify ingredients to be removed
  const ingredientsToRemove = existingIngredients.filter((item: any) => {
    return !parsedIngredients.find((ingredient: any) => ingredient?.sku === item?.ingredient?.sku)
  })

  if (ingredientsToRemove.length > 0) {
    const updatePromises = ingredientsToRemove.map(async (item: any) => {
      await IngredientsModel.updateOne({ _id: item.ingredient?._id }, { $inc: { quantity: -item.qty } })

      await BillIngredientModal.findByIdAndDelete(item._id)

      const lowestCost = await BillIngredientModal.find({ ingredient: item?.ingredient?._id })
        .sort({ cost: 1 })
        .limit(1)

      const highestCost = await BillIngredientModal.find({ ingredient: item?.ingredient?._id })
        .sort({ cost: -1 })
        .limit(1)

      await IngredientsModel.updateOne(
        { _id: item.ingredient?._id },
        {
          $set: {
            cost: {
              highest: highestCost?.[0]?.cost || 0,
              lowest: lowestCost?.[0]?.cost || 0
            }
          }
        }
      )
    })

    await Promise.all(updatePromises)
  }

  // Update or add new ingredients
  const updatePromises = parsedIngredients.map(async (update: any) => {
    const { sku, qty, cost } = update

    const ingredient = await IngredientsModel.findOne({ sku })

    if (!ingredient) {
      throw new Error(`Ingredient with sku ${sku} not exists.`)
    }

    const isBillIngredient = await BillIngredientModal.findOne({
      bill_id: billId,
      ingredient: ingredient?._id
    })

    if (!isBillIngredient) {
      const newIngredients = new BillIngredientModal({
        bill_id: billId,
        sku,
        qty,
        cost,
        ingredient: ingredient?._id
      })

      await IngredientsModel.updateOne(
        { sku },
        {
          $inc: { quantity: qty }
        }
      )
      await newIngredients.save()
    } else {
      const qtyDifference = qty - isBillIngredient.qty

      await IngredientsModel.updateOne(
        { sku },
        {
          $inc: { quantity: qtyDifference }
        }
      )

      await BillIngredientModal.updateOne({ _id: isBillIngredient._id }, { $set: { qty, cost } })
    }

    const lowestCost = await BillIngredientModal.find({ ingredient: ingredient?._id }).sort({ cost: 1 }).limit(1)

    const highestCost = await BillIngredientModal.find({ ingredient: ingredient?._id }).sort({ cost: -1 }).limit(1)

    await IngredientsModel.updateOne(
      { sku },
      {
        $set: {
          cost: {
            highest: highestCost?.[0]?.cost || 0,
            lowest: lowestCost?.[0]?.cost || 0
          }
        }
      }
    )
  })

  await Promise.all(updatePromises)
}
