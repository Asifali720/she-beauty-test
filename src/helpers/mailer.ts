import nodemailer from 'nodemailer'

import { hash } from 'bcryptjs'

import UserModel from '@/models/user.model'

export const sendEmail = async ({ email, emailType, userId, startDate, endDate, pdfBytes, fileType }: any) => {
  try {
    // create a hased token
    let html, subject, attachments

    if (emailType === 'VERIFY') {
      const hashedToken = await hash(userId.toString(), 10)

      await UserModel.findByIdAndUpdate(userId, {
        verifyToken: hashedToken,
        verifyTokenExpiry: Date.now() + 3600000
      })

      subject = 'Verify your email'
      html = `<p>Click <a href="${process.env.DOMAIN}/verify-email?token=${hashedToken}">here</a> to verify your email or copy and paste the link below in your browser. <br>
      ${process.env.DOMAIN}/verify-email?token=${hashedToken}</p>`
    } else if (emailType === 'RESET') {
      const hashedToken = await hash(userId.toString(), 10)

      await UserModel.findByIdAndUpdate(userId, {
        forgotPasswordToken: hashedToken,
        forgotPasswordTokenExpiry: Date.now() + 3600000
      })

      subject = 'Reset your password'
      html = `<p>Click <a href="${process.env.DOMAIN}/reset-password?token=${hashedToken}">here</a> to reset your password
            or copy and paste the link below in your browser. <br>
            ${process.env.DOMAIN}/reset-password?token=${hashedToken}</p>`
    } else if (emailType === 'LEDGER') {
      subject = `Ledger Report ${startDate} to ${endDate}`
      html = `<p>Please find attached the ledger report from ${startDate} to ${endDate}.</p>`
      attachments = [
        {
          filename: `LedgerReport-${startDate}to${endDate}.${fileType}`,
          content: pdfBytes
        }
      ]
    }

    // eslint-disable-next-line import/no-named-as-default-member
    const transport = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: 'wdtest.email1@gmail.com',
        pass: 'cfdofcuxsuwilxtp'

        // pass: 'luayvsunhfwqqiqf'
      }
    })

    const mailOptions = {
      from: 'She Beauty <wdtest.email1@@gmail.com>',
      to: email,
      subject,
      html,
      attachments
    }

    const mailresponse = await transport.sendMail(mailOptions)

    return mailresponse
  } catch (error: any) {
    throw new Error(error.message)
  }
}
