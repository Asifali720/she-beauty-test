import { NextResponse, type NextRequest } from 'next/server'

import { z } from 'zod'

import { connect } from '@/configs/dbconfig'

import OrderModel from '@/models/order.model'
import OrderItemModel from '@/models/orderItem.model'
import RawItemsModel from '@/models/rawitem.model'
import ProductModel from '@/models/product.model'

connect()

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json()
    const { products, total_price, customer_name, phone_no, email, address } = reqBody

    const schema = z.object({
      products: z.array(z.object({ sku: z.string(), quantity: z.number(), cost: z.number() })),
      total_price: z.number(),
      customer_name: z.string(),
      phone_no: z.string().optional(),
      email: z.string().optional(),
      address: z.string().optional()
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

    await updateMultipleProducts(products)

    const newOrder = new OrderModel({
      total_price,
      customer_name,
      phone_no,
      email,
      address,
      status: 'dispatched'
    })

    const newItems = await isValidProducts(products)

    const savedOrder = await newOrder.save()

    const updatedItems = newItems?.map((item: any) => ({
      ...item,
      order_id: savedOrder?._id
    }))

    await OrderItemModel.insertMany(updatedItems)

    return NextResponse.json({
      success: true,
      order: savedOrder
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

const updateMultipleProducts = async (productsToUpdate: any) => {
  const updatePromises = await Promise.all(
    productsToUpdate.map(async (product: any) => {
      const productItem = await ProductModel.findOne({ sku: product.sku })

      if (!productItem) {
        throw new Error(`Product item with sku ${product.sku} not exists`)
      }

      return { raw_items: productItem.raw_items, orderQuantity: product.quantity }
    })
  )

  return updateMultipleRawItems(updatePromises)
}

const updateMultipleRawItems = async (productRawItems: any) => {
  try {
    const updatePromises = await Promise.all(
      productRawItems?.[0]?.raw_items?.map(async (productRawItem: any) => {
        const rawItem = await RawItemsModel.findById(productRawItem?.raw_item)

        if (!rawItem) {
          throw new Error(`Raw item with id ${productRawItem.raw_item} not exists`)
        }

        if (!rawItem.cost) {
          throw new Error(`Raw item cost not available`)
        }

        const totalQty = Number(productRawItems?.[0]?.orderQuantity) * Number(productRawItem?.quantity)

        if (rawItem.quantity < totalQty) {
          throw new Error(`Raw item ${rawItem.sku} quantity not available`)
        }

        await RawItemsModel.updateOne({ _id: rawItem._id }, { $inc: { quantity: -totalQty } })

        return true // Return as resolved value
      })
    )

    await Promise.all(updatePromises)

    return updatePromises // Return the array of valid product IDs
  } catch (error) {
    throw error // Re-throw to propagate the error to the caller
  }
}

const isValidProducts = async (products: any) => {
  try {
    const checkedRawItems = await Promise.all(
      products?.map(async (item: any) => {
        const productItem = await ProductModel.findOne({ sku: item.sku })

        if (!productItem) {
          throw new Error(`Product item with sku ${item.sku} not exists`)
        }

        return { product: productItem._id, qty: item.quantity, cost: item.cost } // Return resolved value
      })
    )

    return checkedRawItems // Return the array of valid product IDs
  } catch (error) {
    throw error // Re-throw to propagate the error to the caller
  }
}
