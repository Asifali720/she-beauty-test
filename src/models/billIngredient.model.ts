import mongoose from 'mongoose'

import Bill from './bill.model'
import IngredientsModel from './ingredients.model'

const billIngredientSchema = new mongoose.Schema(
  {
    bill_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Bill,
      required: [true, 'Please provide a bill_id']
    },
    ingredient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: IngredientsModel,
      required: [true, 'Please provide a ingredient']
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

const BillIngredient = mongoose.models.billIngredients || mongoose.model('billIngredients', billIngredientSchema)

export default BillIngredient
