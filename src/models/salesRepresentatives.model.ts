import mongoose from 'mongoose'

const salesRepresentativeSchema = new mongoose.Schema(
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

const SalesRepresentativesModel =
  mongoose.models.salesRepresentatives || mongoose.model('salesRepresentatives', salesRepresentativeSchema)

export default SalesRepresentativesModel
