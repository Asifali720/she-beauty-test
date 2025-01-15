import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { zfd } from 'zod-form-data'

import { connect } from '@/configs/dbconfig'
import { uploadImageFile } from '@/helpers/upload-image'

import VendorsModel from '@/models/vendor.model'

connect()

export async function POST(request: NextRequest) {
  try {
    const reqFormData = await request.formData()
    const name = reqFormData.get('name')
    const photo = reqFormData.get('photo')
    const phone_no = reqFormData.get('phone_no')
    const email = reqFormData.get('email')
    const address = reqFormData.get('address')
    const note = reqFormData.get('note')

    const schema = zfd.formData({
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

    const photoUrl = await uploadImageFile(photo!)

    const newVendor = new VendorsModel({
      name,
      photo: photoUrl,
      phone_no,
      email,
      address,
      note
    })

    const savedVendor = await newVendor.save()

    return NextResponse.json({
      message: 'Vendor created successfully',
      success: true,
      vendor: savedVendor
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
