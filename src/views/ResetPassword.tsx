'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'

// MUI Imports
import { useSearchParams } from 'next/navigation'

import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'

// Third-party Imports
import classnames from 'classnames'

import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'

import { yupResolver } from '@hookform/resolvers/yup'

import type { AxiosResponse } from 'axios'

import { useMutation } from '@tanstack/react-query'

import { toast } from 'react-toastify'

import type { SystemMode } from '@core/types'
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'
import type { User } from '@/types/user'
import { AuthService } from '@/services'
import { LoadingButton } from '@/components/admin-components'

// Styled Custom Components
const ResetPasswordIllustration = styled('img')(({ theme }) => ({
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
  maxBlockSize: 330,
  inlineSize: '100%',
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1
})

const schema = yup.object().shape({
  newPassword: yup
    .string()
    .min(5, 'Password must be at least 5 characters long')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/\d|[^\w\s]/, 'Password must contain at least one number or symbol')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required()
})

const defaultValues = {
  newPassword: '',
  confirmPassword: ''
}

const ResetPassword = ({ mode }: { mode: SystemMode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)

  // Vars
  const darkImg = '/images/pages/auth-mask-dark.png'
  const lightImg = '/images/pages/auth-mask-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-reset-password-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-reset-password-light.png'

  // Hooks
  const { settings } = useSettings()
  const params = useSearchParams()

  const token = params.get('token')
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const characterIllustration = useImageVariant(mode, lightIllustration, darkIllustration)

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleClickShowConfirmPassword = () => setIsConfirmPasswordShown(show => !show)

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  const onSubmit = (data: User) => {
    const { newPassword, confirmPassword } = data

    if (newPassword === confirmPassword) {
      mutation.mutate({ newPassword, confirmPassword, token })
    } else {
      toast.error('New password and confirm password must be same')
    }
  }

  //Reset password mutation
  const mutation = useMutation({
    mutationFn: AuthService.resetPassword,
    onSuccess: handleResetPasswordSuccess,
    onError: handleResetPasswordError
  })

  function handleResetPasswordSuccess(data: AxiosResponse<any, any>) {
    if (data?.data?.message) {
      toast.success(data?.data?.message || 'Your password has been updated')
    }
  }

  function handleResetPasswordError(error: any) {
    toast.error(error.response.data.error || 'Oops! something went wrong.please try again')
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
        <ResetPasswordIllustration src={characterIllustration} alt='character-illustration' />
        {!hidden && (
          <MaskImg
            alt='mask'
            src={authBackground}
            className={classnames({ 'scale-x-[-1]': theme.direction === 'rtl' })}
          />
        )}
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <div className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'>
          <Logo />
        </div>
        <div className='flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0'>
          <div className='flex flex-col gap-1'>
            <Typography variant='h4'>Reset Password 🔒</Typography>
            <Typography>Your new password must be different from previously used passwords</Typography>
          </div>
          <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
            <Controller
              name='newPassword'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange, onBlur } }) => (
                <CustomTextField
                  autoComplete='off'
                  autoFocus
                  fullWidth
                  value={value}
                  onBlur={onBlur}
                  label='New Password'
                  placeholder='············'
                  onChange={onChange}
                  error={Boolean(errors.newPassword)}
                  {...(errors.newPassword && { helperText: errors.newPassword.message })}
                  type={isPasswordShown ? 'text' : 'password'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton edge='end' onMouseDown={e => e.preventDefault()} onClick={handleClickShowPassword}>
                          <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              )}
            />

            <Controller
              name='confirmPassword'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange, onBlur } }) => (
                <CustomTextField
                  autoComplete='off'
                  value={value}
                  onBlur={onBlur}
                  label='Confirm Password'
                  placeholder='············'
                  onChange={onChange}
                  error={Boolean(errors.confirmPassword)}
                  {...(errors.confirmPassword && { helperText: errors.confirmPassword.message })}
                  type={isConfirmPasswordShown ? 'text' : 'password'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onMouseDown={e => e.preventDefault()}
                          onClick={handleClickShowConfirmPassword}
                        >
                          <i className={isConfirmPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              )}
            />

            <LoadingButton
              label='Set New Password'
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

export default ResetPassword
