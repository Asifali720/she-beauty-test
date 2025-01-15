import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { zfd } from 'zod-form-data'

import { connect } from '@/configs/dbconfig'
import { uploadImageFile } from '@/helpers/upload-image'

import SalesRepresentativesModel from '@/models/salesRepresentatives.model'

connect()

export async function POST(request: NextRequest) {
  try {
    const reqFormData = await request.formData()

    const representativesId = reqFormData.get('representativesId')
    const name = reqFormData.get('name')
    const photo = reqFormData.get('photo')
    const phone_no = reqFormData.get('phone_no')
    const email = reqFormData.get('email')
    const address = reqFormData.get('address')
    const note = reqFormData.get('note')

    const schema = zfd.formData({
      representativesId: zfd.text(),
      name: zfd.text(),
      photo: zfd.file().optional(),
      phone_no: zfd.text().optional(),
      email: zfd.text().optional(),
      address: zfd.text().optional(),
      note: zfd.text().optional()
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

    //check if salesRepresentative already exists
    const salesRepresentative = await SalesRepresentativesModel.findById(representativesId)

    if (!salesRepresentative) {
      return NextResponse.json({ error: 'Sales Representative does not exists' }, { status: 400 })
    }

    // Create an object to store the fields that need to be updated
    const updates = {
      name: salesRepresentative.name,
      photo: salesRepresentative.photo,
      phone_no: salesRepresentative.phone_no,
      email: salesRepresentative.email,
      address: salesRepresentative.address,
      note: salesRepresentative.note
    }

    if (name) {
      updates.name = name
    }

    if (photo) {
      const photoUrl = await uploadImageFile(photo)

      updates.photo = photoUrl
    }

    if (phone_no) {
      updates.phone_no = phone_no
    }

    if (email) {
      updates.email = email
    }

    if (address) {
      updates.address = address
    }

    if (note) {
      updates.note = note
    }

    const updated = await SalesRepresentativesModel.updateOne({ _id: representativesId }, { $set: updates })

    if (updated) {
      const updatedRepresentative = await SalesRepresentativesModel.findById(representativesId)

      return NextResponse.json({
        success: true,
        salesRepresentative: updatedRepresentative
      })
    } else {
      return NextResponse.json({ error: 'Something went wrong' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
