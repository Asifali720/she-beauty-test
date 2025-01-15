import mongoose from 'mongoose'

import DistributorsModal from './distributors.model'

const receivedPaymentSchema = new mongoose.Schema(
  {
    received_payment_number: {
      type: Number,
      required: true,
      unique: true
    },
    distributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: DistributorsModal,
      required: [true, 'Please provide a distributor']
    },
    amount: {
      type: Number,
      required: [true, 'Please provide a amount']
    },
    screenshot: {
      type: String,
      default: ''
    },
    note: {
      type: String,
      default: ''
    },
    payment_date: {
      type: Date,
      default: new Date().toISOString()
    }
  },
  {
    timestamps: true
  }
)

//Adding Received Payment number

receivedPaymentSchema.pre('validate', async function (next) {
  if (this.isNew) {
    const lastReceivedPayment = await mongoose
      .model('receivedPayments')
      .findOne({})
      .sort({ received_payment_number: -1 })

    this.received_payment_number = lastReceivedPayment ? lastReceivedPayment.received_payment_number + 1 : 1
  }

  next()
})

const ReceivedPaymentsModel =
  mongoose.models.receivedPayments || mongoose.model('receivedPayments', receivedPaymentSchema)

export default ReceivedPaymentsModel
