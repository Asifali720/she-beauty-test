import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { z } from 'zod'

import { connect } from '@/configs/dbconfig'
import { sendEmail } from '@/helpers/mailer'
import User from '@/models/user.model'

connect()

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json()
    const { email } = reqBody

    const schema = z.object({
      email: z.string().email()
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

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 })
    }

    await sendEmail({ email, emailType: 'RESET', userId: user._id })

    return NextResponse.json({
      message: 'Your reset password link has been sent to your email',
      success: true
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
