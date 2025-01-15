'use client'

// React Imports
import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'

import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'

import { yupResolver } from '@hookform/resolvers/yup'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

// Component Imports
import { Box, useTheme } from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'
import type { User } from '@/types/user'
import { AuthService } from '@/services'
import { LoadingButton } from '@/components/admin-components'
import { EMAIL_REGX, NAME_REGX, PHONE_REGX, ZIP_CODE_REGX } from '@/utils/emailRegex'

const schema = yup.object().shape({
  name: yup.string().matches(NAME_REGX, 'Only alphabetic characters allowed').required('Name is required'),
  email: yup.string().email().required('Email is Required').matches(EMAIL_REGX, 'Invalid email address'),
  phone: yup.string().required('Phone number is required').matches(PHONE_REGX, 'Invalid phone number format'),
  state: yup.string().required('State is required'),
  zipCode: yup.string().matches(ZIP_CODE_REGX, 'Invalid zip code format').required('Zip code is required')
})

const AccountDetails = () => {
  // States

  const [userData, setUserData] = useState<User>()
  const [fileInput, setFileInput] = useState<string>('')
  const [imgSrc, setImgSrc] = useState<string>('/images/avatars/1.png')

  //hooks
  const theme = useTheme()

  const handleFileInputChange = (file: ChangeEvent) => {
    const reader = new FileReader()
    const { files } = file.target as HTMLInputElement

    if (files && files.length !== 0) {
      reader.onload = () => setImgSrc(reader.result as string)
      reader.readAsDataURL(files[0])

      if (reader.result !== null) {
        setFileInput(reader.result as string)
      }
    }
  }

  const handleFileInputReset = () => {
    setFileInput('')
    setImgSrc('/images/avatars/1.png')
  }

  useEffect(() => {
    AuthService.getMeDetails()
      .then(res => {
        if (res?.data?.message === 'User found') {
          const { name, email, phone, state, zipCode } = res?.data?.data

          setUserData({
            name,
            email,
            phone,
            state,
            zipCode
          })
        }
      })
      .catch(err => {
        console.log({ err })
      })
  }, [])

  const values = {
    name: userData?.name || '',
    email: userData?.email || '',
    phone: userData?.phone || '',
    state: userData?.state || '',
    zipCode: userData?.zipCode || ''
  }

  const {
    control,
    reset,

    // setError,
    handleSubmit,
    formState: { errors }
  } = useForm({
    values,
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  const onSubmit = (data: User) => {
    console.log({ data })
  }

  return (
    <Card>
      <CardContent className='mbe-4'>
        <div className='flex max-sm:flex-col items-center gap-6'>
          <img height={100} width={100} className='rounded' src={imgSrc} alt='Profile' />
          <div className='flex flex-grow flex-col gap-4'>
            <div className='flex flex-col sm:flex-row gap-4'>
              <Button component='label' variant='contained' htmlFor='account-settings-upload-image'>
                Upload New Photo
                <input
                  hidden
                  type='file'
                  value={fileInput}
                  accept='image/png, image/jpeg'
                  onChange={handleFileInputChange}
                  id='account-settings-upload-image'
                />
              </Button>
              <Button variant='tonal' color='secondary' onClick={handleFileInputReset}>
                Reset
              </Button>
            </div>
            <Typography>Allowed JPG, GIF or PNG. Max size of 800K</Typography>
          </div>
        </div>
      </CardContent>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={6}>
            <Grid item xs={12} sm={6}>
              <Controller
                name='name'
                control={control}
                rules={{
                  required: true
                }}
                render={({ field: { value, onChange, onBlur } }) => (
                  <CustomTextField
                    fullWidth
                    label='Full Name'
                    placeholder='Enter your username'
                    value={value}
                    onBlur={onBlur}
                    onChange={onChange}
                    error={Boolean(errors.name)}
                    {...(errors.name && { helperText: errors.name.message })}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='email'
                control={control}
                rules={{
                  required: true
                }}
                render={({ field: { value, onChange, onBlur } }) => (
                  <CustomTextField
                    fullWidth
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
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='phone'
                control={control}
                rules={{
                  required: true
                }}
                render={({ field: { value, onChange, onBlur } }) => (
                  <CustomTextField
                    fullWidth
                    label='Phone Number'
                    value={value}
                    type='number'
                    onBlur={onBlur}
                    onChange={onChange}
                    placeholder='+1 (234) 567-8901'
                    error={Boolean(errors.phone)}
                    {...(errors.phone && { helperText: errors.phone.message })}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='state'
                control={control}
                rules={{
                  required: true
                }}
                render={({ field: { value, onChange, onBlur } }) => (
                  <CustomTextField
                    fullWidth
                    label='State'
                    value={value}
                    onBlur={onBlur}
                    onChange={onChange}
                    placeholder='New York'
                    error={Boolean(errors.state)}
                    {...(errors.state && { helperText: errors.state.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='zipCode'
                control={control}
                rules={{
                  required: true
                }}
                render={({ field: { value, onChange, onBlur } }) => (
                  <CustomTextField
                    fullWidth
                    label='Zip Code'
                    value={value}
                    onBlur={onBlur}
                    onChange={onChange}
                    placeholder='123456'
                    error={Boolean(errors.zipCode)}
                    {...(errors.zipCode && { helperText: errors.zipCode.message })}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} className='flex gap-4 flex-wrap'>
              <Box>
                <LoadingButton label='Save Changes' loading={false} loaderColor={theme.palette.primary.light} />
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

export default AccountDetails
