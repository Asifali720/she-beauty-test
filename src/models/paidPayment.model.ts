import mongoose from 'mongoose'

import VendorsModel from './vendor.model'

const paidPaymentSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: VendorsModel,
      required: [true, 'Please provide a vendor']
    },
    amount: {
      type: Number,
      required: [true, 'Please provide a amount']
    },
    screenshot: {
      type: String,
      default: ''
    },
    note: {
      type: String,
      default: ''
    },
    payment_date: {
      type: Date,
      default: new Date().toISOString()
    }
  },
  {
    timestamps: true
  }
)

const PaidPaymentsModel = mongoose.models.paidPayments || mongoose.model('paidPayments', paidPaymentSchema)

export default PaidPaymentsModel
