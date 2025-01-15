'use client'

// React Imports
import { useState } from 'react'

import { useRouter } from 'next/navigation'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme, type Theme } from '@mui/material/styles'

import { Controller, FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form'

import * as yup from 'yup'

import { yupResolver } from '@hookform/resolvers/yup'

// Third-party Imports
import classnames from 'classnames'

import { FormHelperText } from '@mui/material'

import { useMutation, useQuery } from '@tanstack/react-query'

import { toast } from 'react-toastify'

import CustomTextField from '@core/components/mui/TextField'
import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
import AddActions from './AddActions'
import { useDebounce } from '@/@core/hooks/useDebounce'
import { AdminOrderService, AdminProductService } from '@/services'

import type { Product } from '@/types/product'
import Spinner from './Spinner'
import { EMAIL_REGX_Except_Null, NAME_REGX } from '@/utils/emailRegex'
import { validateUniqueSKU } from '@/helpers/uniqueSku'

const productsSchema = yup
  .array(
    yup.object({
      sku: yup.string().nonNullable('Item cannot be null').required('Product is required'),
      quantity: yup
        .number()
        .nonNullable('Quantity cannot be null')
        .transform(value => (Number.isNaN(value) ? null : value))
        .positive('It must be positive'),
      cost: yup
        .number()
        .nonNullable('Cost cannot be null')
        .transform(value => (Number.isNaN(value) ? null : value))
        .positive('It must be positive')
    })
  )
  .test('unique', 'Duplicate sku are not allowed', validateUniqueSKU)
  .required('Item is required.')

const schema = yup.object().shape({
  customer_name: yup
    .string()
    .matches(NAME_REGX, 'Only alphabetic characters allowed')
    .required('Customer Name is required'),
  phone_no: yup.string(),
  address: yup.string(),
  email: yup.string().email().matches(EMAIL_REGX_Except_Null, 'Invalid email address'),
  products: productsSchema.min(1, 'Atleast one product is required.')
})

const DispatchOrder = () => {
  // States
  const [isLoading, setIsLoading] = useState(false)

  //hooks
  const methods = useForm()
  const theme = useTheme()
  const router = useRouter()
  const productsSearch = useDebounce('')

  const isBelowMdScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))

  const values = {
    customer_name: '',
    phone_no: '',
    address: '',
    email: '',
    products: [{ sku: '', quantity: 0, cost: 0 }]
  }

  //hooks
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    values,
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  const { fields, insert, remove } = useFieldArray({
    control,
    name: 'products'
  })

  // Watch products to recalculate the total cost
  const rawItems = useWatch({ control, name: 'products' })

  // Calculate total cost
  const totalPrice = rawItems.reduce((acc, item) => {
    const itemCost = item.quantity! * item.cost!

    return acc + (itemCost || 0)
  }, 0)

  // Process form data here
  const onSubmit = (data: any) => {
    const { products, customer_name, phone_no, email, address } = data

    setIsLoading(true)
    disptachOrderMutation.mutate({ products, total_price: totalPrice, customer_name, phone_no, email, address })
  }

  //use Query for product searching
  const { data, error, isError } = useQuery({
    queryKey: ['productsSearch', productsSearch],
    queryFn: () => AdminProductService.searchProducts(productsSearch)
  })

  if (isError) toast.error(error.message || 'Oops! something went wrong')

  // Reset function
  const handleReset = () => {
    reset()
    setIsLoading(false)
  }

  //Disptach Order mutation
  const disptachOrderMutation = useMutation({
    mutationFn: AdminOrderService.dispatchOrder,
    onSuccess: handleDisptachOrderSuccess,
    onError: handleDisptachOrderError
  })

  function handleDisptachOrderSuccess(data: any) {
    if (data?.order) {
      handleReset()
      router.back()
      toast.success(data?.message || 'Order disptach successfully')
    }
  }

  function handleDisptachOrderError(error: any) {
    setIsLoading(false)

    if (error.response.data.error)
      toast.error(error.response.data.error || 'Oops! something went wrong.please try again')
  }

  return (
    <div>
      <Spinner open={isLoading} />

      <FormProvider {...methods}>
        <Grid container spacing={6}>
          <Grid item xs={12} md={9}>
            <Card>
              <CardContent className='sm:!p-12 '>
                <Grid container spacing={6}>
                  <Grid item xs={12} md={6}>
                    <div className='flex flex-col gap-y-4'>
                      <Controller
                        name='customer_name'
                        control={control}
                        rules={{
                          required: true
                        }}
                        render={({ field: { value, onChange, onBlur } }) => (
                          <CustomTextField
                            label='Customer Name'
                            fullWidth
                            placeholder='John Doe'
                            value={value}
                            required
                            onBlur={onBlur}
                            onChange={onChange}
                            error={Boolean(errors.customer_name)}
                            {...(errors.customer_name && { helperText: errors.customer_name.message })}
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
                            type='number'
                            placeholder='+923101234567'
                            value={value}
                            onBlur={onBlur}
                            onChange={onChange}
                            error={Boolean(errors.phone_no)}
                            {...(errors.phone_no && { helperText: errors.phone_no.message })}
                          />
                        )}
                      />
                    </div>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <div className='flex flex-col gap-y-4'>
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
                    </div>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider className='border-dashed' />
                  </Grid>
                  <Grid item xs={12}>
                    {fields?.map((item, index) => (
                      <div
                        key={item?.id}
                        className={classnames('repeater-item flex relative mbe-4 border rounded', {
                          'mbs-8': !isBelowMdScreen,
                          '!mbs-14': index !== 0 && !isBelowMdScreen,
                          'gap-5': isBelowMdScreen
                        })}
                      >
                        <Grid container spacing={5} className='m-0 pbe-5'>
                          <Grid item lg={6} md={5} xs={12}>
                            <Typography className='font-medium md:absolute md:-top-8' color='text.primary'>
                              Product{' '}
                              <span
                                style={{
                                  color: theme.palette.error.light
                                }}
                              >
                                *
                              </span>
                            </Typography>
                            <Controller
                              control={control}
                              name={`products.${index}.sku`}
                              rules={{ required: true }}
                              render={({ field: { onChange, value } }) => (
                                <CustomAutocomplete
                                  fullWidth
                                  onChange={(event, item) => {
                                    onChange(item)
                                  }}
                                  value={value}
                                  options={data?.products?.map((item: Product) => item?.sku) || []}
                                  getOptionLabel={item => item}
                                  isOptionEqualToValue={(option, value) =>
                                    value === undefined || value === '' || option === value
                                  }
                                  renderInput={params => (
                                    <CustomTextField
                                      {...params}
                                      error={Boolean(errors.products?.[index]?.sku)}
                                      {...(errors.products?.[index]?.sku && {
                                        helperText: errors.products?.[index]?.sku?.message
                                      })}
                                    />
                                  )}
                                />
                              )}
                            />
                          </Grid>

                          <Grid item lg={2} md={3} xs={12}>
                            <Typography className='font-medium md:absolute md:-top-8'>
                              Price{' '}
                              <span
                                style={{
                                  color: theme.palette.error.light
                                }}
                              >
                                *
                              </span>
                            </Typography>

                            <Controller
                              name={`products.${index}.cost`}
                              control={control}
                              rules={{
                                required: true
                              }}
                              render={({ field: { value, onChange, onBlur } }) => (
                                <CustomTextField
                                  {...(isBelowMdScreen && { fullWidth: true })}
                                  type='number'
                                  placeholder='1'
                                  value={value}
                                  onBlur={onBlur}
                                  className='mbe-5'
                                  onChange={onChange}
                                  error={Boolean(errors?.products?.[index]?.cost)}
                                  {...(errors?.products?.[index]?.cost && {
                                    helperText: errors?.products?.[index]?.cost?.message
                                  })}
                                />
                              )}
                            />
                          </Grid>

                          <Grid item md={2} xs={12}>
                            <Typography className='font-medium md:absolute md:-top-8'>
                              Qty{' '}
                              <span
                                style={{
                                  color: theme.palette.error.light
                                }}
                              >
                                *
                              </span>
                            </Typography>

                            <Controller
                              name={`products.${index}.quantity`}
                              control={control}
                              rules={{
                                required: true
                              }}
                              render={({ field: { value, onChange, onBlur } }) => (
                                <CustomTextField
                                  {...(isBelowMdScreen && { fullWidth: true })}
                                  type='number'
                                  placeholder='1'
                                  value={value}
                                  onBlur={onBlur}
                                  className='mbe-5'
                                  onChange={onChange}
                                  error={Boolean(errors?.products?.[index]?.quantity)}
                                  {...(errors?.products?.[index]?.quantity && {
                                    helperText: errors?.products?.[index]?.quantity?.message
                                  })}
                                />
                              )}
                            />
                          </Grid>

                          <Grid item md={2} xs={12}>
                            <Typography className='font-medium md:absolute md:-top-8'>Total Price</Typography>
                            <Typography className='pt-[12px]'>
                              {watch(`products.${index}.quantity`)! * watch(`products.${index}.cost`)! > 0
                                ? `${watch(`products.${index}.quantity`)! * watch(`products.${index}.cost`)!} Rs`
                                : 0}
                            </Typography>
                          </Grid>
                        </Grid>

                        <div className='flex flex-col justify-center border-is'>
                          <IconButton size='small' onClick={() => remove(index)}>
                            <i className='tabler-x text-actionActive' />
                          </IconButton>
                        </div>
                      </div>
                    ))}

                    <Grid item xs={12}>
                      <Button
                        size='small'
                        variant='contained'
                        onClick={() => insert(fields.length + 1, { sku: '', quantity: 0, cost: 0 })}
                        startIcon={<i className='tabler-plus' />}
                      >
                        Add Product
                      </Button>
                    </Grid>

                    <FormHelperText
                      sx={{
                        color: theme.palette.error.main,
                        fontSize: theme.typography.body2.fontSize,
                        mt: '10px'
                      }}
                    >
                      {errors.products && (errors.products?.root?.message || errors?.products?.message)}
                    </FormHelperText>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider className='border-dashed' />
                  </Grid>
                  <Grid item xs={12}>
                    <div className='flex justify-end flex-col gap-4 sm:flex-row'>
                      <div className='min-is-[200px]'>
                        {/* <div className='flex items-center justify-between'>
                          <Typography>No Of Items:</Typography>
                          <Typography className='font-medium' color='text.primary'>
                            $1800
                          </Typography>
                        </div>
                        <div className='flex items-center justify-between'>
                          <Typography>Total Items:</Typography>
                          <Typography className='font-medium' color='text.primary'>
                            $28
                          </Typography>
                        </div>
                        <div className='flex items-center justify-between'>
                          <Typography>Total Price:</Typography>
                          <Typography className='font-medium' color='text.primary'>
                            21%
                          </Typography>
                        </div>
                        <Divider className='mlb-2' /> */}
                        <div className='flex items-center justify-between'>
                          <Typography>Total order price:</Typography>
                          <Typography className='font-medium' color='text.primary'>
                            {totalPrice > 0 ? `${totalPrice} Rs` : 0}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <AddActions onSubmit={handleSubmit(onSubmit)} />
          </Grid>
        </Grid>
      </FormProvider>
    </div>
  )
}

export default DispatchOrder
