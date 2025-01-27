import { NextResponse, type NextRequest } from 'next/server'

import { z } from 'zod'

import { connect } from '@/configs/dbconfig'

import InvoiceModel from '@/models/invoice.model'
import InvoiceItemModel from '@/models/invoiceItem.model'
import ProductModel from '@/models/product.model'
import DistributorsModel from '@/models/distributors.model'
import RawItemsModel from '@/models/rawitem.model'

connect()

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json()
    const { distributor, products, totalCost, due_date, invoice_date, discount } = reqBody

    const schema = z.object({
      distributor: z.string(),
      totalCost: z.number(),
      due_date: z.string(),
      invoice_date: z.string(),
      products: z.array(z.object({ sku: z.string(), qty: z.number(), cost: z.number() })),
      discount: z.number().optional()
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

    const newInvoice = new InvoiceModel({
      distributor,
      due_date,
      invoice_date,
      status: 'approved',
      discount,
      subtotal: totalCost
    })

    const newItems = await isValidProduct(products)

    const savedInvoice = await newInvoice.save()

    const updatedItems = await newItems?.map((item: any) => ({
      ...item,
      invoice_id: savedInvoice?._id
    }))

    await DistributorsModel.updateOne({ _id: distributor }, { $inc: { to_received: Number(totalCost) } })
    await InvoiceModel.updateOne({ _id: savedInvoice._id }, { $set: { invoice_amount: Number(totalCost) } })
    await InvoiceItemModel.insertMany(updatedItems)

    const invoice = await InvoiceModel.findById(savedInvoice._id).populate('distributor')

    return NextResponse.json({
      success: true,
      invoice
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

const isValidProduct = async (products: any) => {
  try {
    const checkedProducts = await Promise.all(
      products?.map(async (item: any) => {
        const product = await ProductModel.findOne({ sku: item.sku })

        if (!product) {
          throw new Error(`Product with sku ${item.sku} not exists`)
        }

        await isValidRawItem(product.raw_items, item.qty)

        return { product: product._id, qty: item.qty, cost: item.cost } // Return resolved value
      })
    )

    return checkedProducts // Return the array of valid product IDs
  } catch (error) {
    throw error // Re-throw to propagate the error to the caller
  }
}

const isValidRawItem = async (productRawItems: any, productItemQty: number) => {
  try {
    const checkedRawItems = await Promise.all(
      productRawItems?.map(async (productRawItem: any) => {
        const rawItem = await RawItemsModel.findById(productRawItem.raw_item)

        if (!rawItem) {
          throw new Error(`Raw item with id ${productRawItem.raw_item} not exists`)
        }

        if (!rawItem.cost) {
          throw new Error(`Raw item cost not available`)
        }

        const totalQty = Number(productItemQty) * Number(productRawItem.quantity)

        if (rawItem.quantity < totalQty) {
          throw new Error(`Raw item quantity not available`)
        }

        await RawItemsModel.updateOne({ _id: rawItem._id }, { $inc: { quantity: -totalQty } })

        return true // Return as resolved value
      })
    )

    return checkedRawItems // Return the array of valid product IDs
  } catch (error) {
    throw error // Re-throw to propagate the error to the caller
  }
}
