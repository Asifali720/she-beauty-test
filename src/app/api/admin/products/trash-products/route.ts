import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { connect } from '@/configs/dbconfig'

import ProductModel from '@/models/product.model'

connect()

export async function GET(request: NextRequest) {
  const pageNo = Number(request.nextUrl.searchParams.get('pageNo') || 1)
  const size = Number(request.nextUrl.searchParams.get('size') || 10)

  try {
    const totalCount = await ProductModel.countDocuments({
      status: { $eq: 'deleted' }
    }) // Get total number of documents

    const query = {
      skip: size * (pageNo - 1),
      limit: size,
      sort: { createdAt: -1 }
    }

    const products = await ProductModel.find({ status: { $eq: 'deleted' } }, {}, query)

    const productsWithTotalQty = await Promise.all(
      products.map(async product => {
        const totalQty = await calculateTotalQuantity(product)

        return { ...product.toObject(), totalQty: Number(totalQty) } // Add totalQty to the product object
      })
    )

    const totalPages = Math.ceil(totalCount / size)

    const to = size * pageNo
    const from = to - (size - 1)

    return NextResponse.json({
      success: true,
      totalPages,
      totalRows: totalCount,
      from,
      to: to > totalCount ? totalCount : to,
      products: productsWithTotalQty
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

const calculateTotalQuantity = async (product: any) => {
  let productTotalQuantity = Infinity // Initialize with Infinity

  product.raw_items.forEach((item: any) => {
    const possibleQty = item.raw_item.quantity / item.quantity

    if (possibleQty < productTotalQuantity) {
      productTotalQuantity = possibleQty
    }
  })

  return productTotalQuantity
}
