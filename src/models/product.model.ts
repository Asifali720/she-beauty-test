import mongoose from 'mongoose'

import RawItemsModel from './rawitem.model'

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name']
    },
    sku: {
      type: String,
      required: [true, 'Please provide a sku'],
      unique: true
    },
    photo: {
      type: String,
      default: ''
    },
    price: {
      type: Number,
      default: ''
    },
    raw_items: [
      {
        raw_item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: RawItemsModel,
          required: [true, 'Please provide rawItem']
        },
        quantity: {
          type: Number,
          default: 0,
          required: [true, 'Please provide product quantity']
        }
      }
    ],
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

const Product = mongoose.models.products || mongoose.model('products', productSchema)

export default Product
