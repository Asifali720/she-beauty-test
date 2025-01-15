import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { genSalt, hash } from 'bcryptjs'
import { z } from 'zod'

import { connect } from '@/configs/dbconfig'
import User from '@/models/user.model'

connect()

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json()
    const { token, newPassword, confirmPassword } = reqBody

    const schema = z.object({
      token: z.string(),
      newPassword: z.string().min(6),
      confirmPassword: z.string().min(6)
    })

    const validationRules = schema.safeParse(reqBody)

    if (!validationRules.success) {
      const { errors } = validationRules.error

      return NextResponse.json(
        {
          error: { message: 'Invalid request', errors }
        },
        { status: 400 }
      )
    }

    const user = await User.findOne({
      forgotPasswordToken: token,
      forgotPasswordTokenExpiry: { $gt: Date.now() }
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    // check new password or confirm password is matchec
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'New password and confirm password does not matched' }, { status: 400 })
    }

    //hash password
    const salt = await genSalt(10)
    const hashedPassword = await hash(newPassword, salt)

    user.password = hashedPassword
    user.forgotPasswordToken = undefined
    user.forgotPasswordTokenExpiry = undefined
    await user.save()

    return NextResponse.json({
      success: true,
      message: 'Your password has been updated'
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
