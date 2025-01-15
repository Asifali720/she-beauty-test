import { type NextRequest, NextResponse } from 'next/server'

import { z } from 'zod'

import { connect } from '@/configs/dbconfig'
import User from '@/models/user.model'

connect()

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')

    const schema = z.object({
      id: z.string()
    })

    const validationRules = schema.safeParse({ id: request.nextUrl.searchParams.get('id') })

    if (!validationRules.success) {
      const { errors } = validationRules.error

      return NextResponse.json(
        {
          error: { message: 'Invalid request', errors }
        },
        { status: 400 }
      )
    }

    const user = await User.findById(id)
      .select('-password')
      .select('-forgotPasswordToken')
      .select('-forgotPasswordTokenExpiry')
      .select('-verifyToken')
      .select('-verifyTokenExpiry')

    return NextResponse.json({
      success: true,
      data: user
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
