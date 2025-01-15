'use client'

// React Imports
import { useEffect, useState } from 'react'

import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'

import { yupResolver } from '@hookform/resolvers/yup'

import type { AxiosResponse } from 'axios'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

//Component Imports
import { useMutation } from '@tanstack/react-query'

import { toast } from 'react-toastify'

import { Box, useTheme } from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'
import type { User } from '@/types/user'
import { AuthService } from '@/services'
import { LoadingButton } from '@/components/admin-components'

const schema = yup.object().shape({
  password: yup.string().min(5, 'Enter at least 5 characters for password').required(),
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
  password: '',
  newPassword: '',
  confirmPassword: ''
}

const ChangePasswordCard = () => {
  // States
  const [isCurrentPasswordShown, setIsCurrentPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)
  const [isNewPasswordShown, setIsNewPasswordShown] = useState(false)
  const [userData, setUserData] = useState<User>()

  //hooks
  const theme = useTheme()

  const handleClickShowCurrentPassword = () => {
    setIsCurrentPasswordShown(!isCurrentPasswordShown)
  }

  useEffect(() => {
    AuthService.getMeDetails()
      .then(res => {
        if (res?.data?.message === 'User found') {
          const { _id } = res?.data?.data

          setUserData({
            id: _id
          })
        }
      })
      .catch(err => {
        console.log({ err })
      })
  }, [])

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  const onSubmit = (data: User) => {
    const { newPassword, confirmPassword, password } = data

    if (newPassword === confirmPassword && userData?.id) {
      mutation.mutate({ newPassword, confirmPassword, password, id: userData?.id })
    } else {
      toast.error('New password and confirm password must be same')
    }
  }

  //update password mutation
  const mutation = useMutation({
    mutationFn: AuthService.updatePassword,
    onSuccess: handleResetPasswordSuccess,
    onError: handleResetPasswordError
  })

  function handleResetPasswordSuccess(data: AxiosResponse<any, any>) {
    if (data?.data?.message) {
      toast.success(data?.data?.message || 'Your password has been updated')
    }
  }

  function handleResetPasswordError(error: any) {
    console.log({ error })
    if (error.response.data.error)
      toast.error(error.response.data.error || 'Oops! something went wrong.please try again')
    else toast.error('Oops! something went wrong.please try again')
  }

  return (
    <Card>
      <CardHeader title='Change Password' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete='off'>
          <Grid container spacing={6}>
            <Grid item xs={12} sm={6}>
              <Controller
                name='password'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange, onBlur } }) => (
                  <CustomTextField
                    autoComplete='off'
                    fullWidth
                    label='Current Password'
                    type={isCurrentPasswordShown ? 'text' : 'password'}
                    placeholder='············'
                    value={value}
                    onBlur={onBlur}
                    onChange={onChange}
                    error={Boolean(errors.password)}
                    {...(errors.password && { helperText: errors.password.message })}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            edge='end'
                            onMouseDown={e => e.preventDefault()}
                            onClick={handleClickShowCurrentPassword}
                          >
                            <i className={isCurrentPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
          <Grid container className='mbs-0' spacing={6}>
            <Grid item xs={12} sm={6}>
              <Controller
                name='newPassword'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange, onBlur } }) => (
                  <CustomTextField
                    autoComplete='off'
                    fullWidth
                    label='New Password'
                    type={isNewPasswordShown ? 'text' : 'password'}
                    placeholder='············'
                    value={value}
                    onBlur={onBlur}
                    onChange={onChange}
                    error={Boolean(errors.newPassword)}
                    {...(errors.newPassword && { helperText: errors.newPassword.message })}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            edge='end'
                            onClick={() => setIsNewPasswordShown(!isNewPasswordShown)}
                            onMouseDown={e => e.preventDefault()}
                          >
                            <i className={isNewPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='confirmPassword'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange, onBlur } }) => (
                  <CustomTextField
                    autoComplete='off'
                    fullWidth
                    label='Confirm New Password'
                    type={isConfirmPasswordShown ? 'text' : 'password'}
                    placeholder='············'
                    value={value}
                    onBlur={onBlur}
                    onChange={onChange}
                    error={Boolean(errors.confirmPassword)}
                    {...(errors.confirmPassword && { helperText: errors.confirmPassword.message })}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            edge='end'
                            onClick={() => setIsConfirmPasswordShown(!isConfirmPasswordShown)}
                            onMouseDown={e => e.preventDefault()}
                          >
                            <i className={isConfirmPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} className='flex flex-col gap-4'>
              <Typography variant='h6'>Password Requirements:</Typography>
              <div className='flex flex-col gap-4'>
                <div className='flex items-center gap-2.5'>
                  <i className='tabler-circle-filled text-[8px]' />
                  Minimum 5 characters long - the more, the better
                </div>
                <div className='flex items-center gap-2.5'>
                  <i className='tabler-circle-filled text-[8px]' />
                  At least one lowercase & one uppercase character
                </div>
                <div className='flex items-center gap-2.5'>
                  <i className='tabler-circle-filled text-[8px]' />
                  At least one number, symbol, or whitespace character
                </div>
              </div>
            </Grid>
            <Grid item xs={12} className='flex gap-4'>
              <Box>
                <LoadingButton
                  label='Save Changes'
                  loading={mutation?.isPending}
                  loaderColor={theme.palette.primary.light}
                />
              </Box>

              <Button variant='tonal' type='reset' color='secondary' onClick={() => reset()}>
                Reset
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default ChangePasswordCard
