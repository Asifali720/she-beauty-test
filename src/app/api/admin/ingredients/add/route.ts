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

    const schema = zfd.formData({
      name: zfd.text(),
      photo: zfd.file().optional(),
      sku: zfd.text(),
      measurement_unit: zfd.text()
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

    if (ingredient) {
      return NextResponse.json({ error: 'Ingredient already exists' }, { status: 400 })
    }

    const photoUrl = await uploadImageFile(photo!)

    const newIngredient = new IngredientsModel({
      name,
      photo: photoUrl,
      sku,
      measurement_unit
    })

    const savedIngredient = await newIngredient.save()

    return NextResponse.json({
      success: true,
      message: 'Ingredient created successfully',
      ingredient: savedIngredient
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
