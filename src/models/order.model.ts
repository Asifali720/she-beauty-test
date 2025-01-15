import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema(
  {
    total_price: {
      type: String,
      required: [true, 'Please provide a total_price']
    },
    customer_name: {
      type: String,
      required: [true, 'Please provide a customer_name']
    },
    phone_no: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['dispatched', 'returned', 'refund'],
      default: 'dispatched'
    }
  },
  {
    timestamps: true
  }
)

const Order = mongoose.models.orders || mongoose.model('orders', orderSchema)

export default Order
