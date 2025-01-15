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
import { MenuItem } from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'
import { FileUploader, Spinner } from '.'
import type { Ingredient } from '@/types/ingredient'
import { AdminIngredientService } from '@/services'
import { NAME_REGX } from '@/utils/emailRegex'

type Props = {
  open: boolean
  handleClose: () => void
  refetch: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<any, Error>>
  ingredient?: Ingredient
}

const schema = yup.object().shape({
  name: yup.string().matches(NAME_REGX, 'Only alphabetic characters allowed').required('Name is required'),
  sku: yup
    .string()
    .matches(/^[a-zA-Z0-9\-]+(?:['\s\-][a-zA-Z0-9\-]+)*$/, 'Please dont use special characters except hypens')
    .required('SKU is required'),
  measurement_unit: yup.string().required('Please select unit'),
  quantity: yup
    .number()
    .max(-1, 'Quantity must be a negative number')
    .nonNullable('Cost cannot be null')
    .transform(value => (Number.isNaN(value) ? null : value))
    .required('Please reduce quantity')
})

const IngredientReduceQtyDrawer = ({ open, handleClose, refetch, ingredient }: Props) => {
  //states
  const [files, setFiles] = useState<File[]>()
  const [FileError, setFileError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (ingredient) {
      setFiles(ingredient?.photo)
    }
  }, [ingredient])

  const values = {
    name: ingredient?.name || '',
    sku: ingredient?.sku || '',
    measurement_unit: ingredient?.measurement_unit || '',
    quantity: -1
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

  const onSubmit = (data: Ingredient) => {
    const { name, sku, measurement_unit, quantity } = data

    if (ingredient) {
      setIsLoading(true)
      updateIngredientMutation.mutate({ name, sku, photo: files || ingredient?.photo, measurement_unit, quantity })
    }
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

  //update Ingredient mutation
  const updateIngredientMutation = useMutation({
    mutationFn: AdminIngredientService.updateIngredient,
    onSuccess: handleUpdateIngredientSuccess,
    onError: handleUpdateIngredientError
  })

  function handleUpdateIngredientSuccess(data: any) {
    if (data?.ingredient) {
      handleReset()
      toast.success(data?.message || 'Ingredient updated successfully')
    }
  }

  function handleUpdateIngredientError(error: any) {
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
          <Typography variant='h5'>Reduce Ingredient Quantity</Typography>
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
              title='Drop or upload ingredient image'
              disabled
            />

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
                  disabled
                  value={value}
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
                  label='Sku'
                  fullWidth
                  placeholder='Sku'
                  disabled
                  value={value}
                  onBlur={onBlur}
                  onChange={onChange}
                  error={Boolean(errors.sku)}
                  {...(errors.sku && { helperText: errors.sku.message })}
                />
              )}
            />

            <Controller
              name='quantity'
              control={control}
              rules={{
                required: true
              }}
              render={({ field: { value, onChange, onBlur } }) => (
                <CustomTextField
                  label='Quantity'
                  fullWidth
                  type='number'
                  placeholder='Reduce qty e.g -10'
                  value={Math.abs(value) * -1}
                  required
                  onBlur={onBlur}
                  onChange={onChange}
                  error={Boolean(errors.quantity)}
                  {...(errors.quantity && { helperText: errors.quantity.message })}
                />
              )}
            />

            <Controller
              name='measurement_unit'
              control={control}
              rules={{
                required: true
              }}
              render={({ field: { value, onChange, onBlur } }) => (
                <CustomTextField
                  select
                  label='Measurement Unit'
                  fullWidth
                  placeholder='eg.litre'
                  value={value}
                  disabled
                  onBlur={onBlur}
                  onChange={onChange}
                  error={Boolean(errors.measurement_unit)}
                  {...(errors.measurement_unit && { helperText: errors.measurement_unit.message })}
                >
                  <MenuItem value='litre'>litre</MenuItem>
                  <MenuItem value='kg'>kg</MenuItem>
                </CustomTextField>
              )}
            />

            <div className='flex items-center gap-4'>
              <Button variant='contained' type='submit'>
                Update
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

export default IngredientReduceQtyDrawer
