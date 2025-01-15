import { NextResponse } from 'next/server'

import { connect } from '@/configs/dbconfig'

import RawItemsModel from '@/models/rawitem.model'
import ProductsModel from '@/models/product.model'
import VendorsModel from '@/models/vendor.model'
import OrderModel from '@/models/order.model'
import DistributorsModel from '@/models/distributors.model'
import SalesRepresentativesModel from '@/models/salesRepresentatives.model'

connect()

export async function GET() {
  try {
    const rawItems = await RawItemsModel.countDocuments({ status: 'available' })
    const products = await ProductsModel.countDocuments({ status: 'available' })
    const vendors = await VendorsModel.countDocuments({ status: 'available' })
    const orders = await OrderModel.countDocuments({ status: 'dispatched' })
    const distributors = await DistributorsModel.countDocuments({ status: 'available' })
    const salesRepresentatives = await SalesRepresentativesModel.countDocuments({ status: 'available' })

    return NextResponse.json({
      success: true,
      rawItems,
      products,
      vendors,
      orders,
      distributors,
      salesRepresentatives
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
