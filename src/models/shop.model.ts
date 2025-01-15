import mongoose from 'mongoose'

const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name']
    },
    apikey: {
      type: String,
      required: [true, 'Please provide a apikey']
    },
    store_url_prefix: {
      type: String,
      required: [true, 'Please provide a store_url_prefix']
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

const Shop = mongoose.models.shops || mongoose.model('shops', shopSchema)

export default Shop