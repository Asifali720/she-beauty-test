import { NextResponse, type NextRequest } from 'next/server'

import { z } from 'zod'

import { connect } from '@/configs/dbconfig'

import InvoiceModel from '@/models/invoice.model'
import InvoiceItemModel from '@/models/invoiceItem.model'
import DistributorsModel from '@/models/distributors.model'
import ProductModel from '@/models/product.model'
import RawItemsModel from '@/models/rawitem.model'

connect()

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json()
    const { invoiceId, distributor, products, totalCost, due_date, invoice_date } = reqBody

    const schema = z.object({
      invoiceId: z.string(),
      due_date: z.string(),
      invoice_date: z.string(),
      totalCost: z.number(),
      distributor: z.string(),
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

    //check if product exists
    const invoice = await InvoiceModel.findById(invoiceId)
    const isDistributor = await DistributorsModel.findById(distributor)

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice does not exist' }, { status: 400 })
    }

    if (!isDistributor) {
      return NextResponse.json({ error: 'Distributor does not exist' }, { status: 400 })
    }

    // Update distributor's to_received amount if the distributor changes
    if (invoice.distributor !== isDistributor) {
      await DistributorsModel.updateOne(
        { _id: invoice.distributor },
        { $inc: { to_received: -invoice.invoice_amount } }
      )
      await DistributorsModel.updateOne({ _id: isDistributor }, { $inc: { to_received: Number(totalCost) } })
    } else if (Number(totalCost) !== invoice.invoice_amount) {
      const costDifference = Number(totalCost) - invoice.invoice_amount

      await DistributorsModel.updateOne({ _id: isDistributor }, { $inc: { to_received: costDifference } })
    }

    // Create an object to store the fields that need to be updated
    const updates = {
      distributor: invoice.distributor,
      status: invoice.status,
      invoice_amount: Number(totalCost),
      products: invoice.products,
      due_date: invoice.due_date,
      invoice_date: invoice.invoice_date
    }

    updates.status = 'approved'

    if (distributor) {
      updates.distributor = distributor
    }

    if (products) {
      updates.products = products
    }

    if (due_date) {
      updates.due_date = due_date
    }

    if (invoice_date) {
      updates.invoice_date = invoice_date
    }

    // update invoice
    const updated = await InvoiceModel.updateOne({ _id: invoiceId }, { $set: updates })

    // update invoice items
    await updateItem(products, invoiceId)

    if (updated) {
      const invoice = await InvoiceModel.findById(invoiceId).populate('distributor')

      return NextResponse.json({
        success: true,
        invoice
      })
    } else {
      return NextResponse.json({ error: 'Something went wrong' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

const updateItem = async (products: any, invoiceId: any) => {
  const existingProducts = await InvoiceItemModel.find({ invoice_id: invoiceId }).populate('product')

  // Identify products to be removed
  const productsToRemove = existingProducts.filter((item: any) => {
    return !products.find((product: any) => product?.sku === item?.product?.sku)
  })

  if (productsToRemove.length > 0) {
    const updatePromises = productsToRemove.map((item: any) => {
      return ProductModel.updateOne({ _id: item.product?._id }, { $inc: { quantity: -item.qty } })
    })

    await Promise.all(updatePromises)

    const removeIds = productsToRemove.map((item: any) => item._id)

    await InvoiceItemModel.deleteMany({ _id: { $in: removeIds } })
  }

  const updatePromises = products.map(async (update: any) => {
    const { sku, qty, cost } = update

    const product = await ProductModel.findOne({ sku })

    if (!product) {
      throw new Error(`Product with sku ${sku} not exists`)
    }

    const isInvoiceItem = await InvoiceItemModel.findOne({
      invoice_id: invoiceId,
      product: product?._id
    })

    if (!isInvoiceItem) {
      const newItems = new InvoiceItemModel({
        invoice_id: invoiceId,
        product: product?._id,
        qty,
        cost
      })

      await isValidRawItem(product.raw_items, qty)

      await newItems.save()
    } else {
      const newQty = qty - isInvoiceItem.qty

      await isValidRawItem(product.raw_items, newQty)

      const updateOperation = { $set: { sku, qty, cost } }

      return InvoiceItemModel.updateOne({ _id: isInvoiceItem._id }, updateOperation)
    }
  })

  await Promise.all(updatePromises)
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

        const totalQty = Number(productItemQty) * Number(productRawItem?.quantity)

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
