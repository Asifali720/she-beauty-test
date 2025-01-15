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

    if (rawItem) {
      return NextResponse.json({ error: 'Raw Item already exists' }, { status: 400 })
    }

    const photoUrl = await uploadImageFile(photo!)

    const newRawItem = new RawItemsModel({
      name,
      photo: photoUrl,
      sku
    })

    const savedRawItem = await newRawItem.save()

    return NextResponse.json({
      success: true,
      message: 'RawItem created successfully',
      rawItem: savedRawItem
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
