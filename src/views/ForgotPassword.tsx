'use client'

// Next Imports
import Link from 'next/link'

// MUI Imports
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'

// Third-party Imports
import classnames from 'classnames'

import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'

import { yupResolver } from '@hookform/resolvers/yup'

import type { AxiosResponse } from 'axios'

// Component Imports
import { useMutation } from '@tanstack/react-query'

import { toast } from 'react-toastify'

import type { SystemMode } from '@core/types'
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'
import { AuthService } from '@/services'

import type { User } from '@/types/user'
import { LoadingButton } from '@/components/admin-components'
import { EMAIL_REGX } from '@/utils/emailRegex'

// Styled Custom Components
const ForgotPasswordIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  blockSize: 'auto',
  maxBlockSize: 650,
  maxInlineSize: '100%',
  margin: theme.spacing(12),
  [theme.breakpoints.down(1536)]: {
    maxBlockSize: 550
  },
  [theme.breakpoints.down('lg')]: {
    maxBlockSize: 450
  }
}))

const MaskImg = styled('img')({
  blockSize: 'auto',
  maxBlockSize: 355,
  inlineSize: '100%',
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1
})

const schema = yup.object().shape({
  email: yup.string().email().required('Email is Required').matches(EMAIL_REGX, 'Invalid email address')
})

const defaultValues = {
  email: ''
}

const ForgotPassword = ({ mode }: { mode: SystemMode }) => {
  // Vars
  const darkImg = '/images/pages/auth-mask-dark.png'
  const lightImg = '/images/pages/auth-mask-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-forgot-password-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-forgot-password-light.png'

  const { settings } = useSettings()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const characterIllustration = useImageVariant(mode, lightIllustration, darkIllustration)

  const {
    control,
    setError,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  const onSubmit = (data: User) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    const { email } = data

    if (emailRegex.test(email!)) mutation.mutate({ email })
    else
      setError('email', {
        type: 'manual',
        message: 'email must be a valid email'
      })
  }

  //Forget password mutation
  const mutation = useMutation({
    mutationFn: AuthService.ForgetPassword,
    onSuccess: handleForgetPasswordSuccess,
    onError: handleForgetPasswordError
  })

  function handleForgetPasswordSuccess(data: AxiosResponse<any, any>) {
    if (data?.data?.message) {
      toast.success(data?.data?.message || 'Your reset password link has been sent to your email')
    }
  }

  function handleForgetPasswordError(error: any) {
    toast.error(error.response.data.error || 'Oops! something went wrong.please try again')
    setError('email', {
      type: 'manual',
      message: error.response.data.error || 'Email is invalid'
    })
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <ForgotPasswordIllustration src={characterIllustration} alt='character-illustration' />
        {!hidden && <MaskImg alt='mask' src={authBackground} />}
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <div className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'>
          <Logo />
        </div>
        <div className='flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-8 sm:mbs-11 md:mbs-0'>
          <div className='flex flex-col gap-1'>
            <Typography variant='h4'>Forgot Password 🔒</Typography>
            <Typography>Enter your email and we&#39;ll send you instructions to reset your password</Typography>
          </div>
          <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
            <Controller
              name='email'
              control={control}
              rules={{
                required: true,
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email format'
                }
              }}
              render={({ field: { value, onChange, onBlur } }) => (
                <CustomTextField
                  autoFocus
                  fullWidth
                  label='Email'
                  value={value}
                  onBlur={onBlur}
                  onChange={onChange}
                  placeholder='Enter your email'
                  error={Boolean(errors.email)}
                  {...(errors.email && { helperText: errors.email.message })}
                />
              )}
            />

            <LoadingButton
              label='Send Reset Link'
              loading={mutation.isPending}
              loaderColor={theme.palette.primary.light}
            />
            <Typography className='flex justify-center items-center' color='primary'>
              <Link href='/login' className='flex items-center gap-1.5'>
                <i className='tabler-chevron-left text-xl' />
                <span>Back to login</span>
              </Link>
            </Typography>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
