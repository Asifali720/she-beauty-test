'use client'

// React Imports

import { useEffect, useState } from 'react'

import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'

import { yupResolver } from '@hookform/resolvers/yup'

// Type Imports
import type { QueryObserverResult, RefetchOptions } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'

import { toast } from 'react-toastify'

import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import { FileUploader, Spinner } from '.'
import type { RawItems } from '@/types/rawItems'
import { AdminRawItemsService } from '@/services'
import { NAME_REGX } from '@/utils/emailRegex'

type Props = {
  open: boolean
  handleClose: () => void
  selectedPopUp: string
  refetch: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<any, Error>>
  rawItems?: RawItems
}

const schema = yup.object().shape({
  name: yup.string().matches(NAME_REGX, 'Only alphabetic characters allowed').required('Name is required'),
  sku: yup
    .string()
    .matches(/^[a-zA-Z0-9\-]+(?:['\s\-][a-zA-Z0-9\-]+)*$/, 'Please dont use special characters except hypens')
    .required('SKU is required')
})

const RawItemsDrawer = ({ open, handleClose, selectedPopUp, refetch, rawItems }: Props) => {
  //states
  const [files, setFiles] = useState<File[]>()
  const [FileError, setFileError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (rawItems && selectedPopUp === 'edit') {
      setFiles(rawItems?.photo)
    }
  }, [rawItems, selectedPopUp])

  const values = {
    name: selectedPopUp === 'edit' ? rawItems?.name || '' : '',
    sku: selectedPopUp === 'edit' ? rawItems?.sku || '' : ''
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

  const onSubmit = (data: RawItems) => {
    const { name, sku } = data

    setIsLoading(true)

    if (rawItems && selectedPopUp === 'edit')
      updateRawItemsMutation.mutate({ name, sku, photo: files || rawItems?.photo })
    else addRawItemsMutation.mutate({ name, sku, photo: files })
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

  //Add RawItems mutation
  const addRawItemsMutation = useMutation({
    mutationFn: AdminRawItemsService.addRawItems,
    onSuccess: handleAddRawItemsSuccess,
    onError: handleAddRawItemsError
  })

  function handleAddRawItemsSuccess(data: any) {
    if (data?.message) {
      handleReset()
      toast.success(data?.message || 'Raw Item created successfully')
    }
  }

  function handleAddRawItemsError(error: any) {
    refetch()
    setIsLoading(false)

    console.log({ error })

    if (error.response.data.error)
      toast.error(error.response.data.error || 'Oops! something went wrong.please try again')
  }

  //update RawItems mutation
  const updateRawItemsMutation = useMutation({
    mutationFn: AdminRawItemsService.updateRawItems,
    onSuccess: handleUpdateRawItemsSuccess,
    onError: handleUpdateRawItemsError
  })

  function handleUpdateRawItemsSuccess(data: any) {
    if (data?.rawItem) {
      handleReset()
      toast.success(data?.message || 'Raw Item updated successfully')
    }
  }

  function handleUpdateRawItemsError(error: any) {
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
          <Typography variant='h5'>{selectedPopUp === 'add' ? 'Add' : 'Edit'} Raw Item</Typography>
          <IconButton onClick={handleReset}>
            <i className='tabler-x text-textPrimary' />
          </IconButton>
        </div>
        <Divider />
        <div>
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6 p-6 '>
            <FileUploader onDrop={onDrop} files={files} helperText={FileError} title='Drop or upload raw item image' />

            <Controller
              name='name'
              control={control}
              rules={{
                required: true
              }}
              render={({ field: { value, onChange, onBlur } }) => (
                <CustomTextField
                  label='Name'
                  fullWidth
                  placeholder='Name'
                  value={value}
                  required
                  onBlur={onBlur}
                  onChange={onChange}
                  error={Boolean(errors.name)}
                  {...(errors.name && { helperText: errors.name.message })}
                />
              )}
            />

            <Controller
              name='sku'
              control={control}
              rules={{
                required: true
              }}
              render={({ field: { value, onChange, onBlur } }) => (
                <CustomTextField
                  label='SKU'
                  fullWidth
                  placeholder='SKU'
                  disabled={selectedPopUp === 'edit'}
                  value={value}
                  onBlur={onBlur}
                  required
                  onChange={onChange}
                  error={Boolean(errors.sku)}
                  {...(errors.sku && { helperText: errors.sku.message })}
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

export default RawItemsDrawer
