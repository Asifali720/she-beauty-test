'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'

// Third-party Imports
import classnames from 'classnames'
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'

import { yupResolver } from '@hookform/resolvers/yup'

// Type Imports
import { useMutation } from '@tanstack/react-query'

import { toast } from 'react-toastify'

import type { AxiosResponse } from 'axios'

import type { SystemMode } from '@core/types'

// Component Imports
import Link from '@components/Link'
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

import type { User } from '@/types/user'
import { AuthService } from '@/services'
import LoadingButton from '@/components/admin-components/LoadingButton'
import { EMAIL_REGX } from '@/utils/emailRegex'

// Styled Custom Components
const LoginIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  blockSize: 'auto',
  maxBlockSize: 680,
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
  email: yup.string().email().required('Email is Required').matches(EMAIL_REGX, 'Invalid email address'),
  password: yup.string().required('Password is required')
})

const defaultValues = {
  password: '',
  email: ''
}

const LoginV2 = ({ mode }: { mode: SystemMode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [rememberMe, setRememberMe] = useState<boolean>(true)

  // Vars
  const darkImg = '/images/pages/auth-mask-dark.png'
  const lightImg = '/images/pages/auth-mask-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-login-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-login-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-login-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-login-light-border.png'

  // Hooks
  const router = useRouter()
  const { settings } = useSettings()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

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
    const { email, password } = data

    mutation.mutate({ email, password })
  }

  //login mutation
  const mutation = useMutation({
    mutationFn: AuthService.onLogin,
    onSuccess: handleLoginSuccess,
    onError: handleLoginError
  })

  function handleLoginSuccess(data: AxiosResponse<any, any>) {
    if (data.data.message) {
      toast.success(data.data.message || 'Login successful')
      router.push('/admin/dashboard')
    }
  }

  function handleLoginError(error: any) {
    if (error.response.data.error.message) {
      toast.error(error.response.data.error.message || 'Oops! something went wrong.please try again')
      setError('email', {
        type: 'manual',
        message: error.response.data.error.message || 'Email or Password is invalid'
      })
    } else if (error.response.data.error === 'Invalid password') {
      toast.error(error.response.data.error || 'Oops! something went wrong.please try again')
      setError('password', {
        type: 'manual',
        message: error.response.data.error || 'Email or Password is invalid'
      })
    } else {
      toast.error(error.response.data.error || 'Oops! something went wrong.please try again')
      setError('email', {
        type: 'manual',
        message: error.response.data.error || 'Email or Password is invalid'
      })
    }
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
        <LoginIllustration src={characterIllustration} alt='character-illustration' />
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
            <Typography variant='h4'>{`Welcome to ${themeConfig.templateName}! 👋🏻`}</Typography>
            <Typography>Please sign-in to your account and start the adventure</Typography>
          </div>
          <form noValidate autoComplete='on' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
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
                  fullWidth
                  autoFocus
                  label='Email'
                  value={value}
                  onBlur={onBlur}
                  onChange={onChange}
                  placeholder='user@gmail.com'
                  error={Boolean(errors.email)}
                  {...(errors.email && { helperText: errors.email.message })}
                />
              )}
            />

            <Controller
              name='password'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange, onBlur } }) => (
                <CustomTextField
                  fullWidth
                  value={value}
                  onBlur={onBlur}
                  label='Password'
                  placeholder='············'
                  onChange={onChange}
                  autoComplete='off'
                  error={Boolean(errors.password)}
                  {...(errors.password && { helperText: errors.password.message })}
                  type={isPasswordShown ? 'text' : 'password'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton edge='end' onClick={handleClickShowPassword} onMouseDown={e => e.preventDefault()}>
                          <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              )}
            />

            <div className='flex justify-between items-center gap-x-3 gap-y-1 flex-wrap'>
              <FormControlLabel
                label='Remember Me'
                control={<Checkbox checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />}
              />
              <Typography className='text-end' color='primary' component={Link} href='/forgot-password'>
                Forgot password?
              </Typography>
            </div>

            <LoadingButton label='Login' loading={mutation.isPending} loaderColor={theme.palette.primary.light} />
            {/* <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>New on our platform?</Typography>
              <Typography component={Link} color='primary' href='/register'>
                Create an account
              </Typography>
            </div> */}
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginV2
