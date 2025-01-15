import mongoose from 'mongoose'

const distributorSchema = new mongoose.Schema(
  {
    distributor_number: {
      type: Number,
      required: true,
      unique: true
    },
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
    },
    claimed_amount: {
      type: Number,
      default: 0
    },
    to_received: {
      type: Number,
      default: 0
    },
    last_received_amount: {
      type: Number,
      default: 0
    },
    last_received: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
)

//Adding distributor number

distributorSchema.pre('validate', async function (next) {
  if (this.isNew) {
    const lastDistributor = await mongoose.model('distributors').findOne({}).sort({ distributor_number: -1 })

    this.distributor_number = lastDistributor ? lastDistributor.distributor_number + 1 : 1
  }

  next()
})

const DistributorsModel = mongoose.models.distributors || mongoose.model('distributors', distributorSchema)

export default DistributorsModel
