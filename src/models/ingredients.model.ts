import mongoose from 'mongoose'

const ingredientSchema = new mongoose.Schema(
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
      required: [true, 'Please provide a sku']
    },
    quantity: {
      type: Number,
      default: 0
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
    measurement_unit: {
      type: String,
      default: [true, 'Please provide a measurement_unit']
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

const IngredientsModel = mongoose.models.ingredients || mongoose.model('ingredients', ingredientSchema)

export default IngredientsModel
