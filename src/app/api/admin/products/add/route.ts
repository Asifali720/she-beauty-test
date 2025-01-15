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
    const name = reqFormData.get('name')
    const photo = reqFormData.get('photo')
    const sku = reqFormData.get('sku')
    const raw_items = reqFormData.get('raw_items')
    const price = reqFormData.get('price')

    const schema = zfd.formData({
      name: zfd.text(),
      photo: zfd.file(),
      sku: zfd.text(),
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

    //check if product already exists
    const product = await ProductModel.findOne({ sku })

    if (product) {
      return NextResponse.json({ error: 'Product already exists' }, { status: 400 })
    }

    // update bill items
    const rawItems = await isValidRawItem(raw_items)

    const photoUrl = await uploadImageFile(photo!)

    const newProduct = new ProductModel({
      name,
      photo: photoUrl,
      sku,
      price,
      raw_items: rawItems
    })

    const savedProduct = await newProduct.save()

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product: savedProduct
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
