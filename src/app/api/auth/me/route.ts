import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { verifyToken } from '@/helpers/authenticate'
import { connect } from '@/configs/dbconfig'
import User from '@/models/user.model'

connect()

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value || ''

    const decodedUser = await verifyToken(token)

    const user = await User.findOne({ _id: decodedUser?._id })
      .select('-password')
      .select('-forgotPasswordToken')
      .select('-forgotPasswordTokenExpiry')

    return NextResponse.json({
      success: true,
      message: 'User found',
      data: user
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
