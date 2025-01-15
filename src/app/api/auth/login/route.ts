import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { compare } from 'bcryptjs'
import { z } from 'zod'

import { connect } from '@/configs/dbconfig'
import { getToken } from '@/helpers/authenticate'
import User from '@/models/user.model'

connect()

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json()
    const { email, password } = reqBody

    const schema = z.object({
      email: z.string().email(),
      password: z.string()
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

    //check if user exists
    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json({ error: 'User does not exist' }, { status: 400 })
    }

    if (!user.isVerfied) {
      return NextResponse.json({ error: 'User is not verfied' }, { status: 400 })
    }

    //check if password is correct
    const validPassword = await compare(password, user.password)

    if (!validPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 400 })
    }

    //create token data
    const tokenData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }

    //create token
    const token = await getToken(tokenData)

    const response = NextResponse.json({
      success: true,
      message: 'Login successful'
    })

    response.cookies.set('token', token, {
      httpOnly: true
    })

    return response
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
