'use client'

// React Imports

import { useState } from 'react'

import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'

import { yupResolver } from '@hookform/resolvers/yup'

// Type Imports
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
import { Spinner } from '.'
import { AdminInvoiceService } from '@/services'
import { EMAIL_REGX } from '@/utils/emailRegex'
import type { DistributorInvoice } from '@/types/invoice'

type Props = {
  open: boolean
  handleClose: () => void
  invoiceId: string
}

const schema = yup.object().shape({
  fileType: yup.string().required('Please select pdf or csv.'),
  email: yup.string().email().matches(EMAIL_REGX, 'Invalid email address')
})

const InvoiceDrawer = ({ open, handleClose, invoiceId }: Props) => {
  console.log('🚀 ~ InvoiceDrawer ~ invoiceId:', invoiceId)

  //states

  const [isLoading, setIsLoading] = useState(false)

  const values = {
    fileType: 'pdf',
    email: ''
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

  const onSubmit = (data: DistributorInvoice) => {
    const { email, fileType } = data

    if (invoiceId && fileType && email) {
      setIsLoading(true)

      exportInvoiceMutation.mutate({ invoiceId, fileType, email })
    }
  }

  // Reset function
  const handleReset = () => {
    handleClose()
    reset()

    setIsLoading(false)
  }

  //export Ledger mutation
  const exportInvoiceMutation = useMutation({
    mutationFn: AdminInvoiceService.exportDistributorInvoice,
    onSuccess: handleExportInvoiceSuccess,
    onError: handleExportInvoiceError
  })

  function handleExportInvoiceSuccess(data: any) {
    if (data?.message) {
      handleReset()
      toast.success(data?.message || 'Invoice report created successfully')
    }
  }

  function handleExportInvoiceError(error: any) {
    setIsLoading(false)

    if (error.response.data.error) console.log(error.response.data.error, '>>> play write error')
    toast.error(error.response.data.error || 'Oops! something went wrong.please try again later.')
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
          <Typography variant='h5'>Export Invoice</Typography>
          <IconButton onClick={handleReset}>
            <i className='tabler-x text-textPrimary' />
          </IconButton>
        </div>
        <Divider />
        <div>
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6 p-6 '>
            <Controller
              name='email'
              control={control}
              render={({ field: { value, onChange, onBlur } }) => (
                <CustomTextField
                  label='Email'
                  fullWidth
                  sx={{ mt: -4 }}
                  placeholder='johndoe@gmail.com'
                  value={value}
                  required
                  onBlur={onBlur}
                  onChange={onChange}
                  error={Boolean(errors.email)}
                  {...(errors.email && { helperText: errors.email.message })}
                />
              )}
            />

            <Controller
              name='fileType'
              control={control}
              rules={{
                required: true
              }}
              render={({ field: { value, onChange, onBlur } }) => (
                <CustomTextField
                  select
                  label='File Type'
                  fullWidth
                  placeholder='eg.pdf'
                  value={value}
                  required
                  onBlur={onBlur}
                  onChange={onChange}
                  error={Boolean(errors.fileType)}
                  {...(errors.fileType && { helperText: errors.fileType.message })}
                >
                  <MenuItem value='pdf'>Pdf</MenuItem>
                  <MenuItem value='csv'>Csv</MenuItem>
                </CustomTextField>
              )}
            />

            <div className='flex items-center gap-4'>
              <Button variant='contained' type='submit'>
                Export
              </Button>
              <Button variant='tonal' color='error' type='reset' onClick={handleReset}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </Drawer>
    </>
  )
}

export default InvoiceDrawer
