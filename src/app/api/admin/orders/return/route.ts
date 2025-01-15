import { NextResponse, type NextRequest } from 'next/server'

import { connect } from '@/configs/dbconfig'

import Order from '@/models/order.model'
import OrderItemModel from '@/models/orderItem.model'
import ProductModel from '@/models/product.model'
import RawItemsModel from '@/models/rawitem.model'

connect()

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json()
    const { order_id } = reqBody

    const isOrder = await Order.findById(order_id)

    if (!isOrder) return NextResponse.json({ error: 'Order not found' }, { status: 400 })

    const isReturnedOrder = await Order.findOne({
      order_id,
      status: 'returned'
    })

    if (isReturnedOrder) return NextResponse.json({ error: 'Order is already returned' }, { status: 400 })

    const orderItems = await OrderItemModel.find({ order_id })

    await updateMultipleProducts(orderItems)

    await Order.updateOne(
      { _id: order_id },
      {
        $set: {
          status: 'returned'
        }
      }
    )

    const order = await Order.findById(order_id)

    return NextResponse.json({
      success: true,
      order
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

const updateMultipleProducts = async (productsToUpdate: any) => {
  const updatePromises = await Promise.all(
    productsToUpdate.map(async (item: any) => {
      const productItem = await ProductModel.findById(item.product)

      return { raw_items: productItem.raw_items, orderQuantity: item.qty }
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

        await RawItemsModel.updateOne({ _id: rawItem._id }, { $inc: { quantity: totalQty } })

        return true // Return as resolved value
      })
    )

    await Promise.all(updatePromises)

    return updatePromises // Return the array of valid product IDs
  } catch (error) {
    throw error // Re-throw to propagate the error to the caller
  }
}
