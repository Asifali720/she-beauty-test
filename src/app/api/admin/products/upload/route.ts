import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import csv from 'csvtojson'

import { connect } from '@/configs/dbconfig'

import ProductModel from '@/models/product.model'
import RawItemsModel from '@/models/rawitem.model'

connect()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    // Convert the file data to a Buffer
    const products = await processCsv(file)

    const { successfulProducts, failedProducts } = await processProducts(products)

    const newProducts = await ProductModel.insertMany(successfulProducts)

    return NextResponse.json({
      success: true,
      message: 'Process completed',
      successfulProducts: newProducts,
      failedProducts
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

const processCsv = async (file: any) => {
  const buffer = Buffer.from(await (file as File).arrayBuffer())
  const csvJson = buffer.toString()
  const products = await csv().fromString(csvJson)
  const transformedProducts = products.map(product => transformKeys(product))

  return transformedProducts
}

const transformKeys = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(item => transformKeys(item))
  } else if (typeof obj === 'object' && obj !== null) {
    return Object.keys(obj).reduce((acc: any, key) => {
      const newKey = key.toLowerCase().replace(/\s+/g, '_')

      acc[newKey] = transformKeys(obj[key])

      return acc
    }, {})
  }

  return obj
}

const isValidRawItem = async (product: any) => {
  const validJsonString = product.raw_items.replace(/(\w+)\s*:\s*([\w-]+)/g, '"$1":"$2"')

  // Parse the resulting string into a JSON object
  const parsedArray = JSON.parse(validJsonString)

  const checkedRawItems = await Promise.allSettled(
    parsedArray.map(async (item: any) => {
      const rawItem = await RawItemsModel.findOne({ sku: item.sku })

      if (!rawItem) {
        throw new Error(`Raw item with sku ${item.sku} not exists`)
      }

      if (item.quantity > rawItem.quantity) {
        throw new Error(`Raw item quantity should not be greater than ${rawItem.quantity}`)
      }

      return { raw_item: rawItem._id, quantity: item.quantity }
    })
  )

  const validRawItems = checkedRawItems
    .filter(result => result.status === 'fulfilled')
    .map((result: any) => result.value)

  const failedRawItems = checkedRawItems
    .filter(result => result.status === 'rejected')
    .map((result: any) => result.reason.message)

  return { validRawItems, failedRawItems }
}

const processProducts = async (products: any) => {
  const productResults = await Promise.allSettled(
    products.map(async (product: any) => {
      const isProduct = await ProductModel.findOne({ sku: product.handle })

      if (isProduct) {
        throw new Error(`Product with sku ${product.handle} already exists`)
      }

      const { validRawItems, failedRawItems } = await isValidRawItem(product)

      if (failedRawItems?.length) {
        throw new Error(failedRawItems?.[0])
      }

      return {
        name: product.title,
        photo: product.image_src,
        sku: product.handle,
        price: product.variant_price,
        raw_items: validRawItems
      }
    })
  )

  const successfulProducts = productResults
    .filter((result: any) => result.status === 'fulfilled')
    .map((result: any) => result.value)

  const failedProducts = productResults
    .filter((result: any) => result.status === 'rejected')
    .map((result: any) => result.reason.message)

  return { successfulProducts, failedProducts }
}
