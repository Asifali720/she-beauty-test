import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { genSalt, hash, compare } from 'bcryptjs'
import { z } from 'zod'

import { connect } from '@/configs/dbconfig'
import User from '@/models/user.model'

connect()

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json()
    const { userId, currentPassword, newPassword, confirmPassword } = reqBody

    const schema = z.object({
      userId: z.string(),
      currentPassword: z.string().min(6),
      newPassword: z.string().min(6),
      confirmPassword: z.string().min(6)
    })

    const validationRules = schema.safeParse(request.body)

    if (!validationRules.success) {
      const { errors } = validationRules.error

      return NextResponse.json(
        {
          error: { message: 'Invalid request', errors }
        },
        { status: 400 }
      )
    }

    //check if user exists
    const user = await User.findById(userId)

    if (!user) {
      return NextResponse.json({ error: 'User does not exist' }, { status: 400 })
    }

    // check new password or confirm password is matchec
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'New password and confirm password does not matched' }, { status: 400 })
    }

    //check if password is correct
    const validPassword = await compare(currentPassword, user.password)

    if (!validPassword) {
      return NextResponse.json({ error: 'Invalid current password' }, { status: 400 })
    }

    //hash password
    const salt = await genSalt(10)
    const hashedPassword = await hash(newPassword, salt)

    // update password
    const updated = await User.updateOne({ _id: userId }, { $set: { password: hashedPassword } })

    if (updated) {
      return NextResponse.json({
        success: true,
        message: 'Your password has been updated'
      })
    } else {
      return NextResponse.json({ error: 'Something went wrong' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
