import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { zfd } from 'zod-form-data'

import { connect } from '@/configs/dbconfig'
import RawItemsModel from '@/models/rawitem.model'
import { uploadImageFile } from '@/helpers/upload-image'

connect()

export async function POST(request: NextRequest) {
  try {
    const reqFormData = await request.formData()
    const name = reqFormData.get('name')
    const photo = reqFormData.get('photo')
    const sku = reqFormData.get('sku')

    const schema = zfd.formData({
      name: zfd.text(),
      photo: zfd.file().optional(),
      sku: zfd.text()
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

    //check if rawItem already exists
    const rawItem = await RawItemsModel.findOne({ sku })

    if (!rawItem) {
      return NextResponse.json({ error: 'RawItem does not exists' }, { status: 400 })
    }

    // Create an object to store the fields that need to be updated
    const updates = {
      name: rawItem.name,
      photo: rawItem.photo
    }

    if (name) {
      updates.name = name
    }

    if (photo) {
      const photoUrl = await uploadImageFile(photo)

      updates.photo = photoUrl
    }

    const updated = await RawItemsModel.updateOne({ _id: rawItem._id }, { $set: updates })

    if (updated) {
      const newRawItem = await RawItemsModel.findById(rawItem._id)

      return NextResponse.json({
        success: true,
        rawItem: newRawItem
      })
    } else {
      return NextResponse.json({ error: 'Something went wrong' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
