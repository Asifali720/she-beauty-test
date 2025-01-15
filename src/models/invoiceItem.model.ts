import mongoose from 'mongoose'

import InvoiceModel from './invoice.model'
import ProductModel from './product.model'

const invoiceItemSchema = new mongoose.Schema(
  {
    invoice_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: InvoiceModel,
      required: [true, 'Please provide a invoice_id']
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: ProductModel,
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

const InvoiceItem = mongoose.models.invoiceItems || mongoose.model('invoiceItems', invoiceItemSchema)

export default InvoiceItem
