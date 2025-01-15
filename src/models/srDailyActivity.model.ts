import mongoose from 'mongoose'

import SalesRepresentativeModel from './salesRepresentatives.model'

const srDailyActivitySchema = new mongoose.Schema(
  {
    sales_representative: {
      type: mongoose.Schema.Types.ObjectId,
      ref: SalesRepresentativeModel,
      required: [true, 'Please provide sales_representative']
    },
    visit_date: {
      type: Date,
      required: [true, 'Please provide a visit_date'],
      unique: true
    },
    no_of_shops: {
      type: Number,
      default: 0
    },
    no_of_orders: {
      type: Number,
      default: 0
    },
    amount_of_orders: {
      type: Number,
      default: 0
    },
    recovery_amount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
)

const SrDailyActivity = mongoose.models.srdailyactivity || mongoose.model('srdailyactivity', srDailyActivitySchema)

export default SrDailyActivity
