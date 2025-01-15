'use client'

// React Imports
import { useEffect, useState } from 'react'

import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

// Component Imports
import { useMutation, type QueryObserverResult, type RefetchOptions } from '@tanstack/react-query'

import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'

import { yupResolver } from '@hookform/resolvers/yup'

import { toast } from 'react-toastify'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import type { Distributor } from '@/types/distributor'
import { AdminDistributorService } from '@/services'
import { FileUploader, Spinner } from '.'
import { EMAIL_REGX_Except_Null, NAME_REGX } from '@/utils/emailRegex'

type Props = {
  open: boolean
  handleClose: () => void
  selectedPopUp: string
  refetch: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<any, Error>>
  distributor?: Distributor
}

const schema = yup.object().shape({
  name: yup.string().matches(NAME_REGX, 'Only alphabetic characters allowed').required('Name is required'),
  address: yup.string(),
  email: yup.string().email().matches(EMAIL_REGX_Except_Null, 'Invalid email address'),
  phone_no: yup.string(),
  note: yup.string()
})

const DistributorDrawer = ({ open, handleClose, selectedPopUp, distributor, refetch }: Props) => {
  // States
  const [files, setFiles] = useState<File[]>()
  const [FileError, setFileError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (distributor && selectedPopUp === 'edit') {
      setFiles(distributor?.photo)
    }
  }, [distributor, selectedPopUp])

  const values = {
    name: selectedPopUp === 'edit' ? distributor?.name || '' : '',
    address: selectedPopUp === 'edit' ? distributor?.address || '' : '',
    email: selectedPopUp === 'edit' ? distributor?.email || '' : '',
    phone_no: selectedPopUp === 'edit' ? distributor?.phone_no || '' : '',
    note: selectedPopUp === 'edit' ? distributor?.note || '' : ''
  }

  //hooks
  const {
    control,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm({
    values,
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  const onSubmit = (data: Distributor) => {
    const { name, phone_no, note, email, address } = data

    setIsLoading(true)

    if (distributor && selectedPopUp === 'edit')
      updateDistributorMutation.mutate({
        name,
        phone_no,
        note,
        email,
        address,
        photo: files || distributor?.photo,
        _id: distributor?._id
      })
    else addDistributorMutation.mutate({ name, phone_no, note, email, address, photo: files })
  }

  // function to drop or select image
  const onDrop = (acceptedFiles: File[]) => {
    setFiles(acceptedFiles.map((file: File) => Object.assign(file)))
  }

  // Reset function
  const handleReset = () => {
    handleClose()
    reset()
    setFiles(undefined)
    setFileError('')
    setIsLoading(false)
    refetch()
  }

  //Add Distributor mutation
  const addDistributorMutation = useMutation({
    mutationFn: AdminDistributorService.addDistributor,
    onSuccess: handleAddDistributorSuccess,
    onError: handleAddDistributorError
  })

  function handleAddDistributorSuccess(data: any) {
    if (data?.message) {
      handleReset()
      toast.success(data?.message || 'Distributor created successfully')
    }
  }

  function handleAddDistributorError(error: any) {
    refetch()
    setIsLoading(false)

    if (error.response.data.error)
      toast.error(error.response.data.error || 'Oops! something went wrong.please try again')
  }

  //update Distributor mutation
  const updateDistributorMutation = useMutation({
    mutationFn: AdminDistributorService.updateDistributor,
    onSuccess: handleUpdateDistributorSuccess,
    onError: handleUpdateDistributorError
  })

  function handleUpdateDistributorSuccess(data: any) {
    if (data?.distributor) {
      handleReset()
      toast.success(data?.message || 'Distributor updated successfully')
    }
  }

  function handleUpdateDistributorError(error: any) {
    refetch()
    setIsLoading(false)

    if (error.response.data.error)
      toast.error(error.response.data.error || 'Oops! something went wrong.please try again')
  }

  return (
    <>
      <Spinner open={isLoading} />

      <Drawer
        open={open}
        anchor='right'
        variant='temporary'
        onClose={handleReset}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
      >
        <div className='flex items-center justify-between plb-5 pli-6'>
          <Typography variant='h5'>{selectedPopUp === 'add' ? 'Add' : 'Edit'} Distributor</Typography>
          <IconButton onClick={handleReset}>
            <i className='tabler-x text-textPrimary' />
          </IconButton>
        </div>
        <Divider />
        <div>
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6 p-6 '>
            <FileUploader
              onDrop={onDrop}
              files={files}
              helperText={FileError}
              isProfile
              title='Drop or upload distributor image'
            />

            <Controller
              name='name'
              control={control}
              rules={{
                required: true
              }}
              render={({ field: { value, onChange, onBlur } }) => (
                <CustomTextField
                  label='Full Name'
                  fullWidth
                  required
                  placeholder='John Doe'
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
                required: true
              }}
              render={({ field: { value, onChange, onBlur } }) => (
                <CustomTextField
                  label='Email'
                  fullWidth
                  placeholder='johndoe@gmail.com'
                  value={value}
                  onBlur={onBlur}
                  onChange={onChange}
                  error={Boolean(errors.email)}
                  {...(errors.email && { helperText: errors.email.message })}
                />
              )}
            />

            <Controller
              name='address'
              control={control}
              rules={{
                required: true
              }}
              render={({ field: { value, onChange, onBlur } }) => (
                <CustomTextField
                  label='Address'
                  fullWidth
                  multiline
                  placeholder='Main Street, Your County, and Anytown'
                  value={value}
                  onBlur={onBlur}
                  onChange={onChange}
                  error={Boolean(errors.address)}
                  {...(errors.address && { helperText: errors.address.message })}
                />
              )}
            />

            <Controller
              name='phone_no'
              control={control}
              rules={{
                required: true
              }}
              render={({ field: { value, onChange, onBlur } }) => (
                <CustomTextField
                  label='Phone'
                  fullWidth
                  placeholder='+923101234567'
                  type='number'
                  value={value}
                  onBlur={onBlur}
                  onChange={onChange}
                  error={Boolean(errors.phone_no)}
                  {...(errors.phone_no && { helperText: errors.phone_no.message })}
                />
              )}
            />

            <Controller
              name='note'
              control={control}
              rules={{
                required: true
              }}
              render={({ field: { value, onChange, onBlur } }) => (
                <CustomTextField
                  label='Note'
                  placeholder='Type a note'
                  multiline
                  rows={4}
                  fullWidth
                  value={value}
                  onBlur={onBlur}
                  onChange={onChange}
                  error={Boolean(errors.note)}
                  {...(errors.note && { helperText: errors.note.message })}
                />
              )}
            />
            <div className='flex items-center gap-4'>
              <Button variant='contained' type='submit'>
                {selectedPopUp === 'add' ? 'Submit' : 'Update'}
              </Button>
              <Button variant='tonal' color='error' type='reset' onClick={() => handleReset()}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </Drawer>
    </>
  )
}

export default DistributorDrawer
