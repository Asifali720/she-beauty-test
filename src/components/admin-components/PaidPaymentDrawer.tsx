'use client'

// React Imports
import { useEffect, useState } from 'react'

import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

// Component Imports
import { useMutation, useQuery, type QueryObserverResult, type RefetchOptions } from '@tanstack/react-query'

import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'

import { yupResolver } from '@hookform/resolvers/yup'

import { toast } from 'react-toastify'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import type { PaidPayment } from '@/types/paid-payment'
import { AdminPaidPaymentService, AdminVendorService } from '@/services'
import { FileUploader, Spinner } from '.'
import { useDebounce } from '@/@core/hooks/useDebounce'
import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
import type { Vendor } from '@/types/vendor'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

type Props = {
  open: boolean
  handleClose: () => void
  selectedPopUp: string
  refetch: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<any, Error>>
  paidPayment?: PaidPayment
}

const schema = yup.object().shape({
  vendor: yup
    .object({
      _id: yup.string().required('Vendor is required'),
      name: yup.string().required('Vendor is required')
    })
    .required('Vendor is required'),
  amount: yup
    .string()
    .transform(value => (Number.isNaN(value) ? null : value))
    .nonNullable()
    .required('Amount required'),
  payment_date: yup.string().required('PaidPayment date is required'),
  note: yup.string()
})

const PaidPaymentDrawer = ({ open, handleClose, selectedPopUp, paidPayment, refetch }: Props) => {
  // States
  const [files, setFiles] = useState<File[]>()
  const [FileError, setFileError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const debounceSearch = useDebounce('')

  useEffect(() => {
    if (paidPayment && selectedPopUp === 'edit') {
      setFiles(paidPayment?.screenshot)
    }
  }, [paidPayment, selectedPopUp])

  const values = {
    vendor:
      selectedPopUp === 'edit'
        ? { _id: paidPayment?.vendor?._id || '', name: paidPayment?.vendor?.name || '' }
        : { _id: '', name: '' },
    amount: selectedPopUp === 'edit' ? paidPayment?.amount || '' : '',
    payment_date: selectedPopUp === 'edit' ? paidPayment?.payment_date || '' : '',
    note: selectedPopUp === 'edit' ? paidPayment?.note || '' : ''
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

  const onSubmit = (data: PaidPayment) => {
    const { vendor, payment_date, note, amount } = data

    if (paidPayment && selectedPopUp === 'edit') {
      setIsLoading(true)

      updatePaidPaymentMutation.mutate({
        vendor: vendor?._id,
        payment_date: payment_date,
        note,
        amount,
        screenshot: files || paidPayment?.screenshot,
        _id: paidPayment?._id
      })
    } else {
      if (!files) setFileError('Image is required')
      else {
        setIsLoading(true)
        addPaidPaymentMutation.mutate({ vendor: vendor?._id, note, amount, payment_date, screenshot: files })
      }
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

  //Add Paid Payment mutation
  const addPaidPaymentMutation = useMutation({
    mutationFn: AdminPaidPaymentService.addPaidPayment,
    onSuccess: handleAddPaymentSuccess,
    onError: handleAddPaymentError
  })

  function handleAddPaymentSuccess(data: any) {
    if (data?.message) {
      handleReset()
      toast.success(data?.message || 'Paid Payment created successfully')
    }
  }

  function handleAddPaymentError(error: any) {
    refetch()
    setIsLoading(false)

    if (error.response.data.error)
      toast.error(error.response.data.error || 'Oops! something went wrong.please try again')
  }

  //update Paid Payment mutation
  const updatePaidPaymentMutation = useMutation({
    mutationFn: AdminPaidPaymentService.UpdatePaidPayment,
    onSuccess: handleUpdatePaymentSuccess,
    onError: handleUpdatePaymentError
  })

  function handleUpdatePaymentSuccess(data: any) {
    if (data?.paidPayment) {
      handleReset()
      toast.success(data?.message || 'Paid Payment updated successfully')
    }
  }

  function handleUpdatePaymentError(error: any) {
    refetch()
    setIsLoading(false)

    if (error.response.data.error)
      toast.error(error.response.data.error || 'Oops! something went wrong.please try again')
  }

  //use Query for vendors searching
  const { data, error, isError } = useQuery({
    queryKey: ['VendorSearchForPaidPayment', debounceSearch],
    queryFn: () => AdminVendorService.searchVendors(debounceSearch)
  })

  if (isError) toast.error(error.message || 'Oops! something went wrong')

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
          <Typography variant='h5'>{selectedPopUp === 'add' ? 'Add' : 'Edit'} Paid Payment</Typography>
          <IconButton onClick={handleReset}>
            <i className='tabler-x text-textPrimary' />
          </IconButton>
        </div>
        <Divider />
        <div>
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6 p-6 ' autoComplete='off'>
            <FileUploader
              onDrop={onDrop}
              files={files}
              helperText={FileError}
              isProfile
              title='Drop or upload Paid Payment image'
              required
            />

            <Controller
              control={control}
              name={`vendor`}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <CustomAutocomplete
                  fullWidth
                  onChange={(event, item) => {
                    onChange(item)
                  }}
                  value={value}
                  options={data?.vendors?.map((item: Vendor) => item) || []}
                  getOptionLabel={item => item.name}
                  isOptionEqualToValue={(option, value) =>
                    value?._id === undefined || value?._id === '' || option?._id === value?._id
                  }
                  renderInput={params => (
                    <CustomTextField
                      {...params}
                      error={Boolean(errors.vendor)}
                      {...(errors.vendor && { helperText: errors.vendor.message })}
                      label='Vendors'
                      placeholder='e.g john'
                      required
                    />
                  )}
                />
              )}
            />

            <Controller
              name='amount'
              control={control}
              rules={{
                required: true
              }}
              render={({ field: { value, onChange, onBlur } }) => (
                <CustomTextField
                  label='Amount'
                  fullWidth
                  type='number'
                  required
                  placeholder='eg. 10'
                  value={value}
                  onBlur={onBlur}
                  onChange={onChange}
                  error={Boolean(errors.amount)}
                  {...(errors.amount && { helperText: errors.amount.message })}
                />
              )}
            />

            <Controller
              name='payment_date'
              control={control}
              rules={{
                required: true
              }}
              render={({ field: { value, onChange } }) => (
                <AppReactDatepicker
                  selected={value}
                  placeholderText='DD-MM-YYYY'
                  dateFormat={'dd-MM-yyyy'}
                  onChange={onChange}
                  customInput={
                    <CustomTextField
                      fullWidth
                      label='Payment Date *'
                      error={Boolean(errors.payment_date)}
                      {...(errors.payment_date && { helperText: errors.payment_date.message })}
                    />
                  }
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

export default PaidPaymentDrawer
