'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'

// MUI Imports
import { useRouter } from 'next/navigation'

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

import { FormHelperText } from '@mui/material'

import type { SystemMode } from '@core/types'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'
import type { User } from '@/types/user'
import { AuthService } from '@/services'
import { LoadingButton } from '@/components/admin-components'
import { EMAIL_REGX } from '@/utils/emailRegex'

// Styled Custom Components
const RegisterIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  blockSize: 'auto',
  maxBlockSize: 600,
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
  maxBlockSize: 345,
  inlineSize: '100%',
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1
})

const schema = yup.object().shape({
  checkbox: yup.boolean().test('checkbox', 'please agree to continue', val => {
    return val
  }),
  name: yup.string().required(),
  email: yup.string().email().required('Email is Required').matches(EMAIL_REGX, 'Invalid email address'),
  password: yup.string().min(5).required()
})

const defaultValues = {
  password: '',
  email: '',
  name: '',
  checkbox: false
}

const Register = ({ mode }: { mode: SystemMode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)

  // Vars
  const darkImg = '/images/pages/auth-mask-dark.png'
  const lightImg = '/images/pages/auth-mask-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-register-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-register-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-register-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-register-light-border.png'

  const { settings } = useSettings()
  const router = useRouter()
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    const { name, email, password } = data

    const role = 'master_admin'

    if (emailRegex.test(email!)) mutation.mutate({ email, password, name, role })
    else
      setError('email', {
        type: 'manual',
        message: 'email must be a valid email'
      })
  }

  //  Sign up mutation
  const mutation = useMutation({
    mutationFn: AuthService.onSignUp,
    onSuccess: handleSignUpSuccess,
    onError: handleSignUpError
  })

  function handleSignUpSuccess(data: AxiosResponse<any, any>) {
    const { isVerfied } = data?.data?.user

    if (data?.data?.message) {
      toast.success(data?.data?.message || 'User created successfully')
    }

    if (isVerfied) router.push('/login')
    else router.push('/verifyEmail')
  }

  function handleSignUpError(error: any) {
    toast.error(error.response.data.error || 'Oops! something went wrong.please try again')
    setError('email', {
      type: 'manual',
      message: error.response.data.error || 'Email or Password is invalid'
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
        <RegisterIllustration src={characterIllustration} alt='character-illustration' />
        {!hidden && <MaskImg alt='mask' src={authBackground} />}
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <div className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'>
          <Logo />
        </div>
        <div className='flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-8 sm:mbs-11 md:mbs-0'>
          <div className='flex flex-col gap-1'>
            <Typography variant='h4'>Adventure starts here 🚀</Typography>
            <Typography>Make your app management easy and fun!</Typography>
          </div>
          <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
            <Controller
              name='name'
              control={control}
              rules={{
                required: true
              }}
              render={({ field: { value, onChange, onBlur } }) => (
                <CustomTextField
                  fullWidth
                  autoComplete='off'
                  autoFocus
                  label='Username'
                  placeholder='Enter your username'
                  value={value}
                  onBlur={onBlur}
                  onChange={onChange}
                  error={Boolean(errors.name)}
                  {...(errors.name && { helperText: errors.name.message })}
                />
              )}
            />

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
                  label='Email'
                  autoComplete='off'
                  value={value}
                  onBlur={onBlur}
                  onChange={onChange}
                  placeholder='Enter your email'
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
                  autoComplete='off'
                  onChange={onChange}
                  id='auth-login-v2-password'
                  error={Boolean(errors.password)}
                  {...(errors.password && { helperText: errors.password.message })}
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

            <FormControlLabel
              control={<Controller name='checkbox' control={control} render={({ field }) => <Checkbox {...field} />} />}
              label={
                <>
                  <span>I agree to </span>
                  <Link className='text-primary' href='/' onClick={e => e.preventDefault()}>
                    privacy policy & terms
                  </Link>
                </>
              }
            />

            <FormHelperText
              sx={{
                mt: -6,
                color: theme.palette.error.main,
                fontSize: theme.typography.body2.fontSize
              }}
            >
              {errors.checkbox && errors.checkbox.message}
            </FormHelperText>

            <LoadingButton label='Sign Up' loading={mutation.isPending} loaderColor={theme.palette.primary.light} />
            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>Already have an account?</Typography>
              <Typography component={Link} href={'/login'} color='primary'>
                Sign in instead
              </Typography>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
