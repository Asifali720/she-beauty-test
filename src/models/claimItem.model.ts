import mongoose from 'mongoose'

import ClaimModel from './claims.model'
import ProductModel from './product.model'

const claimItemSchema = new mongoose.Schema(
  {
    claim_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: ClaimModel,
      required: [true, 'Please provide a claim']
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

const ClaimItem = mongoose.models.claimItems || mongoose.model('claimItems', claimItemSchema)

export default ClaimItem
