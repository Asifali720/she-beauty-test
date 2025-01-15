import mongoose from 'mongoose'

import Distributor from './distributors.model'

const claimSchema = new mongoose.Schema(
  {
    claim_number: {
      type: Number,
      required: true,
      unique: true
    },
    distributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Distributor,
      required: [true, 'Please provide a distributor']
    },
    total_cost: {
      type: Number,
      default: 0
    },
    note: {
      type: String,
      default: ''
    },
    claimed_at: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
)

//Adding claim number

claimSchema.pre('validate', async function (next) {
  if (this.isNew) {
    const lastClaim = await mongoose.model('claims').findOne({}).sort({ claim_number: -1 })

    this.claim_number = lastClaim ? lastClaim.claim_number + 1 : 1
  }

  next()
})

const Claim = mongoose.models.claims || mongoose.model('claims', claimSchema)

export default Claim
