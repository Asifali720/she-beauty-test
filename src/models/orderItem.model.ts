import mongoose from 'mongoose'

import Order from './order.model'
import ProductsModel from './product.model'

const orderItemSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Order,
      required: [true, 'Please provide a order_id']
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: ProductsModel,
      required: [true, 'Please provide a product']
    },
    qty: {
      type: Number,
      required: [true, 'Please provide a qty']
    },
    cost: {
      type: Number,
      required: [true, 'Please provide a cost']
    }
  },
  {
    timestamps: true
  }
)

const OrderItem = mongoose.models.orderItems || mongoose.model('orderItems', orderItemSchema)

export default OrderItem
