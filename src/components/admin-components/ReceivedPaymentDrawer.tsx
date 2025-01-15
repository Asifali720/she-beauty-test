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
import type { ReceivedPayment } from '@/types/received-payment'
import { AdminReceivedPaymentService, AdminDistributorService } from '@/services'
import { FileUploader, Spinner } from '.'
import { useDebounce } from '@/@core/hooks/useDebounce'
import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
import type { Distributor } from '@/types/distributor'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

type Props = {
  open: boolean
  handleClose: () => void
  selectedPopUp: string
  refetch: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<any, Error>>
  receivedPayment?: ReceivedPayment
}

const schema = yup.object().shape({
  distributor: yup
    .object({
      _id: yup.string().required('Distributor is required'),
      name: yup.string().required('Distributor is required')
    })
    .required('Distributor is required'),
  amount: yup
    .string()
    .transform(value => (Number.isNaN(value) ? null : value))
    .nonNullable()
    .required('Amount required'),
  payment_date: yup.string().required('ReceivedPayment date is required'),
  note: yup.string()
})

const ReceivedPaymentDrawer = ({ open, handleClose, selectedPopUp, receivedPayment, refetch }: Props) => {
  // States
  const [files, setFiles] = useState<File[]>()
  const [FileError, setFileError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const debounceSearch = useDebounce('')

  useEffect(() => {
    if (receivedPayment && selectedPopUp === 'edit') {
      setFiles(receivedPayment?.screenshot)
    }
  }, [receivedPayment, selectedPopUp])

  const values = {
    distributor:
      selectedPopUp === 'edit'
        ? { _id: receivedPayment?.distributor?._id || '', name: receivedPayment?.distributor?.name || '' }
        : { _id: '', name: '' },
    amount: selectedPopUp === 'edit' ? receivedPayment?.amount || '' : '',
    payment_date: selectedPopUp === 'edit' ? receivedPayment?.payment_date || '' : '',
    note: selectedPopUp === 'edit' ? receivedPayment?.note || '' : ''
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

  const onSubmit = (data: ReceivedPayment) => {
    const { distributor, payment_date, note, amount } = data

    if (receivedPayment && selectedPopUp === 'edit') {
      setIsLoading(true)

      updateReceivedPaymentMutation.mutate({
        distributor: distributor?._id,
        payment_date: payment_date,
        note,
        amount,
        screenshot: files || receivedPayment?.screenshot,
        _id: receivedPayment?._id
      })
    } else {
      if (!files) setFileError('Image is required')
      else {
        setIsLoading(true)
        addReceivedPaymentMutation.mutate({
          distributor: distributor?._id,
          note,
          amount,
          payment_date,
          screenshot: files
        })
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

  //Add Received Payment mutation
  const addReceivedPaymentMutation = useMutation({
    mutationFn: AdminReceivedPaymentService.addReceivedPayment,
    onSuccess: handleAddPaymentSuccess,
    onError: handleAddPaymentError
  })

  function handleAddPaymentSuccess(data: any) {
    if (data?.message) {
      handleReset()
      toast.success(data?.message || 'Received Payment created successfully')
    }
  }

  function handleAddPaymentError(error: any) {
    refetch()
    setIsLoading(false)

    if (error.response.data.error)
      toast.error(error.response.data.error || 'Oops! something went wrong.please try again')
  }

  //update Received Payment mutation
  const updateReceivedPaymentMutation = useMutation({
    mutationFn: AdminReceivedPaymentService.UpdateReceivedPayment,
    onSuccess: handleUpdatePaymentSuccess,
    onError: handleUpdatePaymentError
  })

  function handleUpdatePaymentSuccess(data: any) {
    if (data?.receivedPayment) {
      handleReset()
      toast.success(data?.message || 'Received Payment updated successfully')
    }
  }

  function handleUpdatePaymentError(error: any) {
    refetch()
    setIsLoading(false)

    if (error.response.data.error)
      toast.error(error.response.data.error || 'Oops! something went wrong.please try again')
  }

  //use Query for distributors searching
  const { data, error, isError } = useQuery({
    queryKey: ['DistributorSearchForReceivedPayment', debounceSearch],
    queryFn: () => AdminDistributorService.searchDistributor(debounceSearch)
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
          <Typography variant='h5'>{selectedPopUp === 'add' ? 'Add' : 'Edit'} Received Payment</Typography>
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
              title='Drop or upload Received Payment image'
              required
            />

            <Controller
              control={control}
              name={`distributor`}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <CustomAutocomplete
                  fullWidth
                  onChange={(event, item) => {
                    onChange(item)
                  }}
                  value={value}
                  options={data?.distributors?.map((item: Distributor) => item) || []}
                  getOptionLabel={item => item.name}
                  isOptionEqualToValue={(option, value) =>
                    value?._id === undefined || value?._id === '' || option?._id === value?._id
                  }
                  renderInput={params => (
                    <CustomTextField
                      {...params}
                      error={Boolean(errors.distributor)}
                      {...(errors.distributor && { helperText: errors.distributor.message })}
                      label='Distributors'
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

export default ReceivedPaymentDrawer
