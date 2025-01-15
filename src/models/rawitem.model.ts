import mongoose from 'mongoose'

const rawItemsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name']
    },
    photo: {
      type: String,
      default: ''
    },
    sku: {
      type: String,
      unique: true
    },
    cost: {
      highest: {
        type: Number,
        default: 0
      },
      lowest: {
        type: Number,
        default: 0
      }
    },
    quantity: {
      type: Number,
      default: 0
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

const RawItemsModel = mongoose.models.rawItems || mongoose.model('rawItems', rawItemsSchema)

export default RawItemsModel
