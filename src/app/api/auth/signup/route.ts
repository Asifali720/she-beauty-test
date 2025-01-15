import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { genSalt, hash } from 'bcryptjs'
import { z } from 'zod'

import { connect } from '@/configs/dbconfig'

// import { sendEmail } from '@/helpers/mailer'
import User from '@/models/user.model'

connect()

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json()
    const { name, email, password, role } = reqBody

    const schema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string().min(6),
      role: z.string()
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

    //check if user already exists
    const user = await User.findOne({ email })

    if (user) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    //hash password
    const salt = await genSalt(10)
    const hashedPassword = await hash(password, salt)

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      isVerfied: true //remove when email available
    })

    const savedUser = await newUser.save()

    // await sendEmail({ email, emailType: 'VERIFY', userId: newUser._id })

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: savedUser
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
