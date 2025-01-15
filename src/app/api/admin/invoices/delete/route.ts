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
    const invoiceId = request.nextUrl.searchParams.get('invoiceId')

    const schema = z.object({
      invoiceId: z.string()
    })

    const validationRules = schema.safeParse({ invoiceId: request.nextUrl.searchParams.get('invoiceId') })

    if (!validationRules.success) {
      const { errors } = validationRules.error

      return NextResponse.json(
        {
          error: { message: 'Invalid request', errors }
        },
        { status: 400 }
      )
    }

    const invoice = await InvoiceModel.findById(invoiceId)

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice does not exist' }, { status: 400 })
    }

    const distributor_amount = await DistributorsModel.updateOne(
      { _id: invoice.distributor },
      { $inc: { to_received: -invoice.invoice_amount } }
    )

    const invoiceItems = await InvoiceItemModel.find({ invoice_id: invoiceId })

    await updateInvoiceItems(invoiceItems)

    const invoiceItemsDeleted = await InvoiceItemModel.deleteMany({ invoice_id: invoiceId })

    const invoiceDeleted = await InvoiceModel.findByIdAndDelete(invoiceId)

    if (distributor_amount && invoiceDeleted && invoiceItemsDeleted) {
      return NextResponse.json({
        success: true,
        message: 'Invoice deleted successflly'
      })
    } else {
      return NextResponse.json({ error: 'Something went wrong' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

const updateInvoiceItems = async (invoiceItems: any) => {
  try {
    const updatedInvoiceItems = invoiceItems.map(async (item: any) => {
      const product = await ProductModel.findOne({ _id: item.product })

      if (!product) {
        throw new Error(`Product with sku ${item.sku} not exists`)
      }

      await isValidRawItem(product.raw_items, item.qty)

      return true
    })

    await Promise.all(updatedInvoiceItems)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
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

        const totalQty = Number(productItemQty) * Number(productRawItem?.quantity)

        await RawItemsModel.updateOne({ _id: rawItem._id }, { $inc: { quantity: totalQty } })

        return true // Return as resolved value
      })
    )

    return checkedRawItems // Return the array of valid product IDs
  } catch (error) {
    throw error // Re-throw to propagate the error to the caller
  }
}
