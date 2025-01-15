import mongoose from 'mongoose'

import Bill from './bill.model'
import RawItemsModel from './rawitem.model'

const billItemSchema = new mongoose.Schema(
  {
    bill_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Bill,
      required: [true, 'Please provide a bill_id']
    },
    raw_item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: RawItemsModel,
      required: [true, 'Please provide a rawItem']
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

const BillItem = mongoose.models.billItems || mongoose.model('billItems', billItemSchema)

export default BillItem
