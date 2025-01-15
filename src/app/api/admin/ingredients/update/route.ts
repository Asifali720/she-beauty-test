import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { zfd } from 'zod-form-data'

import { connect } from '@/configs/dbconfig'

import IngredientsModel from '@/models/ingredients.model'
import { uploadImageFile } from '@/helpers/upload-image'

connect()

export async function POST(request: NextRequest) {
  try {
    const reqFormData = await request.formData()
    const name = reqFormData.get('name')
    const photo = reqFormData.get('photo')
    const sku = reqFormData.get('sku')
    const measurement_unit = reqFormData.get('measurement_unit')
    const quantity = reqFormData.get('quantity')

    const schema = zfd.formData({
      name: zfd.text(),
      photo: zfd.file().optional(),
      sku: zfd.text(),
      measurement_unit: zfd.text(),
      quantity: zfd.numeric().optional()
    })

    const validationRules = schema.safeParse(reqFormData)

    if (!validationRules.success) {
      const { errors } = validationRules.error

      return NextResponse.json(
        {
          error: { message: 'Invalid request', errors }
        },
        { status: 400 }
      )
    }

    //check if ingredient already exists
    const ingredient = await IngredientsModel.findOne({ sku })

    if (!ingredient) {
      return NextResponse.json({ error: 'Ingredient does not exists.' }, { status: 400 })
    }

    // Check if new quantity would result in negative quantity
    if (quantity) {
      if (ingredient.quantity + Number(quantity) < 0) {
        return NextResponse.json({ error: 'Insufficient quantity.' }, { status: 400 })
      }
    }

    // Create an object to store the fields that need to be updated
    const updates = {
      name: ingredient.name,
      photo: ingredient.photo,
      measurement_unit: ingredient.measurement_unit,
      quantity: ingredient.quantity
    }

    if (name) {
      updates.name = name
    }

    if (measurement_unit) {
      updates.measurement_unit = measurement_unit
    }

    if (photo) {
      const photoUrl = await uploadImageFile(photo)

      updates.photo = photoUrl
    }

    if (quantity) {
      updates.quantity = ingredient.quantity + Number(quantity)
    }

    const updated = await IngredientsModel.updateOne({ _id: ingredient._id }, { $set: updates })

    if (updated) {
      const newIngredient = await IngredientsModel.findById(ingredient._id)

      return NextResponse.json({
        success: true,
        ingredient: newIngredient
      })
    } else {
      return NextResponse.json({ error: 'Something went wrong' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
