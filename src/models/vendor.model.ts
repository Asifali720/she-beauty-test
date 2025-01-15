import mongoose from 'mongoose'

const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name']
    },
    photo: {
      type: String,
      default: ''
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
    note: {
      type: String,
      default: ''
    },
    balance_amount: {
      type: Number,
      default: 0
    },
    last_paid_amount: {
      type: Number,
      default: 0
    },
    last_paid: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['available', 'deleted'],
      default: 'available'
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
)

const VendorsModel = mongoose.models.vendors || mongoose.model('vendors', vendorSchema)

export default VendorsModel
