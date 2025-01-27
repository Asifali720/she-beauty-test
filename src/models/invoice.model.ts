import mongoose from 'mongoose'

import Distributor from './distributors.model'

const invoiceSchema = new mongoose.Schema(
  {
    invoice_number: {
      type: Number,
      required: true,
      unique: true
    },
    distributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Distributor,
      required: [true, 'Please provide a distributor']
    },
    due_date: {
      type: Date,
      required: [true, 'Please provide a due_date']
    },
    invoice_date: {
      type: Date,
      required: [true, 'Please provide a invoice_date']
    },
    status: {
      type: String,
      enum: ['pending', 'approved'],
      default: 'pending'
    },
    invoice_amount: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    subtotal: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
)

//Adding invoice number

invoiceSchema.pre('validate', async function (next) {
  if (this.isNew) {
    const lastInvoice = await mongoose.model('invoices').findOne({}).sort({ invoice_number: -1 })

    this.invoice_number = lastInvoice ? lastInvoice.invoice_number + 1 : 1
  }

  next()
})

const Invoice = mongoose.models.invoices || mongoose.model('invoices', invoiceSchema)

export default Invoice
