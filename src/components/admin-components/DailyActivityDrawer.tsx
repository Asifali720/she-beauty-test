'use client'

// React Imports
import { useState } from 'react'

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
import { AdminDailyActivityService, AdminSrService } from '@/services'
import { Spinner } from '.'
import type { DailyActivity } from '@/types/daily-activity'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
import { useDebounce } from '@/@core/hooks/useDebounce'
import type { SalesRepresentative } from '@/types/sales-representative'

type Props = {
  open: boolean
  handleClose: () => void
  selectedPopUp: string
  refetch: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<any, Error>>
  dailyActivity?: DailyActivity
}

const schema = yup.object().shape({
  no_of_orders: yup
    .number()
    .transform(value => (Number.isNaN(value) ? null : value))
    .nullable() // Allow null (optional)
    .test('not-negative', 'Value cannot be negative.', value => value === null || value! >= 0),
  no_of_shops: yup
    .number()
    .transform(value => (Number.isNaN(value) ? null : value))
    .positive('It must be positive')
    .nonNullable()
    .required('No of shops visit is required.'),
  amount_of_orders: yup
    .number()
    .transform(value => (Number.isNaN(value) ? null : value))
    .positive('It must be positive')
    .nonNullable()
    .required('Total amount of orders is required.'),
  recovery_amount: yup
    .number()
    .transform(value => (Number.isNaN(value) ? null : value))
    .test('not-negative', 'Value cannot be negative.', value => value === null || value! >= 0)
    .nonNullable()
    .required('Recovery amount is required.'),
  visit_date: yup.string().required('Visit date is required'),
  sales_representative: yup.object({
    _id: yup.string().required(),
    name: yup.string().required('Sales representative is required.')
  })
})

const DailyActivityDrawer = ({ open, handleClose, selectedPopUp, dailyActivity, refetch }: Props) => {
  // States
  const [isLoading, setIsLoading] = useState(false)
  const debounceSearch = useDebounce('')

  const values = {
    no_of_orders: selectedPopUp === 'edit' ? dailyActivity?.no_of_orders || 0 : 0,
    no_of_shops: selectedPopUp === 'edit' ? dailyActivity?.no_of_shops || 0 : 0,
    amount_of_orders: selectedPopUp === 'edit' ? dailyActivity?.amount_of_orders || 0 : 0,
    recovery_amount: selectedPopUp === 'edit' ? dailyActivity?.recovery_amount || 0 : 0,
    visit_date: selectedPopUp === 'edit' ? dailyActivity?.visit_date || '' : '',
    sales_representative:
      selectedPopUp === 'edit' && dailyActivity
        ? { _id: dailyActivity?.sales_representative?._id || '', name: dailyActivity?.sales_representative?.name || '' }
        : { _id: '', name: '' }
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

  const onSubmit = (data: any) => {
    const { no_of_orders, no_of_shops, amount_of_orders, visit_date, sales_representative, recovery_amount } = data

    setIsLoading(true)
    if (dailyActivity && selectedPopUp === 'edit')
      updateDailyActivityMutation.mutate({
        visit_date,
        no_of_shops,
        no_of_orders,
        amount_of_orders,
        _id: dailyActivity?._id,
        recovery_amount
      })
    else
      addDailyActivityMutation.mutate({
        no_of_orders,
        no_of_shops,
        amount_of_orders,
        visit_date,
        sales_representative: sales_representative?._id,
        recovery_amount
      })
  }

  // Reset function
  const handleReset = () => {
    handleClose()
    reset()
    setIsLoading(false)
    refetch()
  }

  //Add DailyActivity mutation
  const addDailyActivityMutation = useMutation({
    mutationFn: AdminDailyActivityService.addActivity,
    onSuccess: handleAddDailyActivitySuccess,
    onError: handleAddDailyActivityError
  })

  function handleAddDailyActivitySuccess(data: any) {
    if (data?.message) {
      handleReset()
      toast.success(data?.message || 'Daily Activity created successfully')
    }
  }

  function handleAddDailyActivityError(error: any) {
    refetch()
    setIsLoading(false)

    if (error.response.data.error)
      toast.error(error.response.data.error || 'Oops! something went wrong.please try again')
  }

  //update DailyActivity mutation
  const updateDailyActivityMutation = useMutation({
    mutationFn: AdminDailyActivityService.UpdateActivity,
    onSuccess: handleUpdateDailyActivitySuccess,
    onError: handleUpdateDailyActivityError
  })

  function handleUpdateDailyActivitySuccess(data: any) {
    if (data?.srDailyActivity) {
      handleReset()
      toast.success(data?.message || 'Daily Activity updated successfully')
    }
  }

  function handleUpdateDailyActivityError(error: any) {
    refetch()
    setIsLoading(false)

    if (error.response.data.error)
      toast.error(error.response.data.error || 'Oops! something went wrong.please try again')
  }

  //use Query for salesRepresentative searching
  const { data, error, isError } = useQuery({
    queryKey: ['salesRepresentativeSearchForDailyActivity', debounceSearch],
    queryFn: () => AdminSrService.searchSalesRepresentative(debounceSearch)
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
          <Typography variant='h5'>{selectedPopUp === 'add' ? 'Add' : 'Edit'} Daily Activity</Typography>
          <IconButton onClick={handleReset}>
            <i className='tabler-x text-textPrimary' />
          </IconButton>
        </div>
        <Divider />
        <div>
          <form onSubmit={handleSubmit(onSubmit)} autoComplete='off' className='flex flex-col gap-6 p-6 '>
            <Controller
              control={control}
              name={`sales_representative`}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => {
                return (
                  <CustomAutocomplete
                    fullWidth
                    onChange={(event, item) => {
                      onChange(item)
                    }}
                    disabled={Boolean(dailyActivity)}
                    value={value}
                    options={data?.salesRepresentatives?.map((item: SalesRepresentative) => item) || []}
                    getOptionLabel={item => item.name}
                    isOptionEqualToValue={(option, values) =>
                      values?._id === undefined || values?._id === '' || option?._id === values?._id
                    }
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        label='Sales Representatives'
                        placeholder='e.g john'
                        required
                        error={Boolean(errors.sales_representative?.name)}
                        {...(errors.sales_representative?.name && {
                          helperText: errors?.sales_representative?.name.message
                        })}
                      />
                    )}
                  />
                )
              }}
            />

            <Controller
              name='no_of_orders'
              control={control}
              render={({ field: { value, onChange, onBlur } }) => (
                <CustomTextField
                  label='No Of Orders'
                  fullWidth
                  type='number'
                  placeholder='eg. 10'
                  value={value}
                  onBlur={onBlur}
                  onChange={onChange}
                  error={Boolean(errors.no_of_orders)}
                  {...(errors.no_of_orders && { helperText: errors.no_of_orders.message })}
                />
              )}
            />

            <Controller
              name='no_of_shops'
              control={control}
              rules={{
                required: true
              }}
              render={({ field: { value, onChange, onBlur } }) => (
                <CustomTextField
                  label='No Of Shops Visit'
                  fullWidth
                  type='number'
                  placeholder='eg. 10'
                  required
                  value={value}
                  onBlur={onBlur}
                  onChange={onChange}
                  error={Boolean(errors.no_of_shops)}
                  {...(errors.no_of_shops && { helperText: errors.no_of_shops.message })}
                />
              )}
            />

            <Controller
              name='visit_date'
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
                      label='Visit Date *'
                      error={Boolean(errors.visit_date)}
                      {...(errors.visit_date && { helperText: errors.visit_date.message })}
                    />
                  }
                />
              )}
            />

            <Controller
              name='amount_of_orders'
              control={control}
              rules={{
                required: true
              }}
              render={({ field: { value, onChange, onBlur } }) => (
                <CustomTextField
                  label='Total Amount Of Orders'
                  fullWidth
                  type='number'
                  placeholder='eg. 10'
                  value={value}
                  required
                  onBlur={onBlur}
                  onChange={onChange}
                  error={Boolean(errors.amount_of_orders)}
                  {...(errors.amount_of_orders && { helperText: errors.amount_of_orders.message })}
                />
              )}
            />

            <Controller
              name='recovery_amount'
              control={control}
              rules={{
                required: true
              }}
              render={({ field: { value, onChange, onBlur } }) => (
                <CustomTextField
                  label='Recovery Amount'
                  fullWidth
                  type='number'
                  placeholder='eg. 10'
                  value={value}
                  required
                  onBlur={onBlur}
                  onChange={onChange}
                  error={Boolean(errors.recovery_amount)}
                  {...(errors.recovery_amount && { helperText: errors.recovery_amount.message })}
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

export default DailyActivityDrawer
