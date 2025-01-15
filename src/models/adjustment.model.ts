import mongoose from 'mongoose'

import DistributorsModel from './distributors.model'

const adjustmentSchema = new mongoose.Schema(
  {
    adjustment_number: {
      type: Number,
      required: true,
      unique: true
    },
    distributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: DistributorsModel,
      required: [true, 'Please provide a distributor']
    },
    amount: {
      type: Number,
      required: [true, 'Please provide a amount']
    },
    note: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
)

//Adding adjustment number

adjustmentSchema.pre('validate', async function (next) {
  if (this.isNew) {
    const lastAdjustment = await mongoose.model('adjustments').findOne({}).sort({ adjustment_number: -1 })

    this.adjustment_number = lastAdjustment ? lastAdjustment.adjustment_number + 1 : 1
  }

  next()
})

const AdjustmentsModel = mongoose.models.adjustments || mongoose.model('adjustments', adjustmentSchema)

export default AdjustmentsModel
