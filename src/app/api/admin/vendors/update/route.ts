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

    const vendorId = reqFormData.get('vendorId')
    const name = reqFormData.get('name')
    const photo = reqFormData.get('photo')
    const phone_no = reqFormData.get('phone_no')
    const email = reqFormData.get('email')
    const address = reqFormData.get('address')
    const note = reqFormData.get('note')

    const schema = zfd.formData({
      vendorId: zfd.text(),
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

    //check if rawItem already exists
    const vendor = await VendorsModel.findById(vendorId)

    if (!vendor) {
      return NextResponse.json({ error: 'RawItem does not exists' }, { status: 400 })
    }

    // Create an object to store the fields that need to be updated
    const updates = {
      name: vendor.name,
      photo: vendor.photo,
      phone_no: vendor.phone_no,
      email: vendor.email,
      address: vendor.address,
      note: vendor.note
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

    const updated = await VendorsModel.updateOne({ _id: vendorId }, { $set: updates })

    if (updated) {
      const updatedVendor = await VendorsModel.findById(vendorId)

      return NextResponse.json({
        success: true,
        vendor: updatedVendor
      })
    } else {
      return NextResponse.json({ error: 'Something went wrong' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
