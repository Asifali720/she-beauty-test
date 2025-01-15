import mongoose from 'mongoose'

import Vendor from './vendor.model'

const billSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Vendor,
      required: [true, 'Please provide a vendor']
    },
    status: {
      type: String,
      enum: ['pending', 'approved'],
      default: 'approved'
    },
    bill_date: {
      type: Date,
      required: [true, 'Please provide a bill_date']
    },
    bill_amount: {
      type: Number,
      default: 0
    },
    bill_image: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
)

const Bill = mongoose.models.bills || mongoose.model('bills', billSchema)

export default Bill
