import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { zfd } from 'zod-form-data'

import { connect } from '@/configs/dbconfig'

import ProductModel from '@/models/product.model'
import RawItemsModel from '@/models/rawitem.model'
import { uploadImageFile } from '@/helpers/upload-image'

connect()

export async function POST(request: NextRequest) {
  try {
    const reqFormData = await request.formData()
    const productId = reqFormData.get('productId')
    const name = reqFormData.get('name')
    const photo = reqFormData.get('photo')
    const raw_items = reqFormData.get('raw_items')
    const price = reqFormData.get('price')

    const schema = zfd.formData({
      productId: zfd.text(),
      name: zfd.text(),
      photo: zfd.file().optional(),
      raw_items: zfd.text(),
      price: zfd.numeric()
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
    const product = await ProductModel.findById(productId)

    if (!product) {
      return NextResponse.json({ error: 'Product not exist' }, { status: 400 })
    }

    // Create an object to store the fields that need to be updated
    const updates = {
      name: product.name,
      price: product.price,
      photo: product.photo,
      raw_items: product.raw_items
    }

    if (name) {
      updates.name = name
    }

    if (price) {
      updates.price = price
    }

    if (photo) {
      const photoUrl = await uploadImageFile(photo)

      updates.photo = photoUrl
    }

    if (raw_items) {
      // update product items
      const res = await isValidRawItem(raw_items)

      updates.raw_items = res
    }

    // update product
    const updated = await ProductModel.updateOne({ _id: productId }, { $set: updates })

    if (updated) {
      const product = await ProductModel.findById(productId).populate('raw_items.raw_item')

      const newComboObj = await {
        ...product?._doc,
        products: product?.products?.map((item: any) => ({
          ...item?.raw_items?._doc,
          quantityInCombo: item?.quantity
        }))
      }

      return NextResponse.json({
        success: true,
        product: newComboObj
      })
    } else {
      return NextResponse.json({ error: 'Something went wrong' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

const isValidRawItem = async (rawItems: any) => {
  const parsedRawItems = await JSON.parse(rawItems)

  try {
    const checkedRawItems = await Promise.all(
      parsedRawItems?.map(async (item: any) => {
        const rawItem = await RawItemsModel.findOne({ sku: item.raw_item })

        if (!rawItem) {
          throw new Error(`Raw item with sku ${item.raw_item} not exists`)
        }

        return { raw_item: rawItem._id, quantity: item.quantity } // Return only the ID, as resolved value
      })
    )

    return checkedRawItems // Return the array of valid product IDs
  } catch (error) {
    throw error // Re-throw to propagate the error to the caller
  }
}
