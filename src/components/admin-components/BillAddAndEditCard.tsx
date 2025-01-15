'use client'

// React Imports
import { useEffect, useState } from 'react'

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
import { AdminBillService, AdminIngredientService, AdminRawItemsService, AdminVendorService } from '@/services'

import type { RawItems } from '@/types/rawItems'
import type { Vendor } from '@/types/vendor'
import Spinner from './Spinner'
import type { Bill, BillIngredients, BillItems } from '@/types/bill'
import FileUploader from './FileUploader'
import type { Ingredient } from '@/types/ingredient'
import { validateUniqueSKU } from '@/helpers/uniqueSku'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

const rawItemSchema = yup
  .array(
    yup.object({
      sku: yup.string().nonNullable('Raw item cannot be null').required('Raw item is required'),
      qty: yup
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
  .test('unique', 'Duplicate raw items are not allowed', validateUniqueSKU)
  .required('Raw item is required.')

const ingredientSchema = yup
  .array(
    yup.object({
      sku: yup.string().nonNullable('ingredient cannot be null').required('Ingredient is required'),
      qty: yup
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
  .test('unique', 'Duplicate ingredient are not allowed', validateUniqueSKU)
  .required('Ingredient is required.')

const schema = yup.object().shape({
  vendor: yup
    .object({
      _id: yup.string().required(),
      name: yup.string().required('Vendor is required.'),
      phone_no: yup.string().optional().nullable(),
      address: yup.string().optional().nullable(),
      email: yup.string().optional().nullable()
    })
    .required('Vendor is required'),
  raw_items: rawItemSchema,
  ingredients: ingredientSchema,
  bill_date: yup.string().required('Bill date is required')
})

const BillAddAndEditCard = ({ params }: { params?: { billId: string } }) => {
  // States
  const [files, setFiles] = useState<File[]>()
  const [FileError, setFileError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [vendorInput, setVendorInput] = useState('')

  //hooks
  const methods = useForm()
  const theme = useTheme()
  const router = useRouter()
  const rawItemsSearch = useDebounce('')
  const ingredientsSearch = useDebounce('')
  const vendorSearch = useDebounce(vendorInput)
  const isBelowMdScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))
  const isBelowSmScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
  const billId = params?.billId

  // use Query for getting Bill data by id when updating bill
  const getBillbyId = useQuery({
    queryKey: [`Bills/edit/${billId}`, billId],
    queryFn: () => AdminBillService.getBillById(billId),
    enabled: Boolean(billId)
  })

  const billVendor: Bill = getBillbyId?.data?.data?.bill || {}
  const billRawItems: BillItems[] = getBillbyId?.data?.data?.billItems || [{}]
  const billIngredients: BillIngredients[] = getBillbyId?.data?.data?.billIngredients || [{}]

  useEffect(() => {
    if (params?.billId && billVendor?.bill_image) {
      setFiles(billVendor?.bill_image)
    }
  }, [params?.billId, billVendor?.bill_image])

  const values = {
    vendor: billVendor
      ? {
          name: billVendor?.vendor?.name || '',
          _id: billVendor?.vendor?._id || '',
          phone_no: billVendor?.vendor?.phone_no || '',
          address: billVendor?.vendor?.address || '',
          email: billVendor?.vendor?.email || ''
        }
      : { name: '', _id: '', phone_no: '', address: '', email: '' },
    raw_items: billRawItems
      ? billRawItems?.map(item => ({
          sku: item?.raw_item?.sku || '',
          qty: item?.qty || 0,
          cost: item?.cost || 0
        })) || [{ sku: '', qty: 0, cost: 0 }]
      : [{ sku: '', qty: 0, cost: 0 }],
    ingredients: billIngredients
      ? billIngredients?.map(item => ({
          sku: item?.ingredient?.sku || '',
          qty: item?.qty || 0,
          cost: item?.cost || 0
        })) || [{ sku: '', qty: 0, cost: 0 }]
      : [{ sku: '', qty: 0, cost: 0 }],
    bill_date: billVendor?.bill_date ? billVendor?.bill_date || '' : ''
  }

  // function to drop or select image
  const onDrop = (acceptedFiles: File[]) => {
    setFiles(acceptedFiles.map((file: File) => Object.assign(file)))
  }

  //hooks
  const {
    control,
    handleSubmit,
    reset,
    watch,
    getValues,
    formState: { errors },
    setError
  } = useForm({
    values,
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  const { fields, insert, remove } = useFieldArray({
    control,
    name: 'raw_items'
  })

  const {
    fields: ingredientFields,
    insert: ingredientInsert,
    remove: ingredientRemove
  } = useFieldArray({
    control,
    name: 'ingredients'
  })

  // Watch raw_items to recalculate the total cost
  const rawItems = useWatch({ control, name: 'raw_items' })
  const ingredients = useWatch({ control, name: 'ingredients' })

  // Calculate total cost
  const getTotalCost = (rawItems: any, ingredients: any) => {
    const totalCostOfRawItems = rawItems.reduce((accumulator: any, product: any) => {
      const multipliedValue = Number(product.qty) * Number(product.cost)

      return accumulator + multipliedValue
    }, 0)

    const totalCostOfIngredients = ingredients.reduce((accumulator: any, product: any) => {
      const multipliedValue = Number(product.qty) * Number(product.cost)

      return accumulator + multipliedValue
    }, 0)

    return totalCostOfRawItems + totalCostOfIngredients
  }

  // Process form data here
  const onSubmit = (data: any) => {
    const { vendor, raw_items, ingredients, bill_date } = data

    if (raw_items.length > 0 || ingredients.length > 0) {
      if (billId) {
        if (!files) setFileError('Image is required')
        else {
          setIsLoading(true)
          updateBillMutation.mutate({
            vendorId: vendor?._id,
            raw_items: raw_items,
            ingredients: ingredients,
            _id: billId,
            bill_image: files || billVendor?.bill_image,
            totalCost: Number(getTotalCost(rawItems, ingredients)),
            bill_date: bill_date
          })
        }
      } else {
        if (!files) setFileError('Image is required')
        else {
          setIsLoading(true)
          addBillMutation.mutate({
            vendorId: vendor?._id,
            raw_items: raw_items,
            ingredients: ingredients,
            bill_image: files,
            totalCost: Number(getTotalCost(rawItems, ingredients)),
            bill_date: bill_date
          })
        }
      }
    } else {
      setError('ingredients', {
        type: 'manual',
        message: 'At least one (raw item or ingredient) is required'
      })
    }
  }

  //use Query for rawitems searching
  const { data, error, isError } = useQuery({
    queryKey: ['rawItemsSearchForBill', rawItemsSearch],
    queryFn: () => AdminRawItemsService.searchRawItems(rawItemsSearch)
  })

  if (isError) toast.error(error.message || 'Oops! something went wrong')

  //use Query for ingredients searching
  const searchIngredientData = useQuery({
    queryKey: ['ingredientsSearchForBill', ingredientsSearch],
    queryFn: () => AdminIngredientService.searchIngredient(ingredientsSearch)
  })

  if (searchIngredientData?.isError) toast.error(searchIngredientData?.error.message || 'Oops! something went wrong')

  //use Query for vendor searching
  const vendorSearchData = useQuery({
    queryKey: ['vendorSearchForBill', vendorSearch],
    queryFn: () => AdminVendorService.searchVendors(vendorSearch)
  })

  if (isError) toast.error(error.message || 'Oops! something went wrong')

  // Reset function
  const handleReset = () => {
    reset()

    setFiles(undefined)
    setFileError('')
    setIsLoading(false)
  }

  //Add Bill mutation
  const addBillMutation = useMutation({
    mutationFn: AdminBillService.addBill,
    onSuccess: handleAddBillSuccess,
    onError: handleAddBillError
  })

  function handleAddBillSuccess(data: any) {
    if (data?.bill) {
      handleReset()
      toast.success(data?.message || 'Bill created successfully')
    }
  }

  function handleAddBillError(error: any) {
    setIsLoading(false)

    if (error.response.data.error)
      toast.error(error.response.data.error || 'Oops! something went wrong.please try again')
  }

  //Update Bill mutation
  const updateBillMutation = useMutation({
    mutationFn: AdminBillService.updateBill,
    onSuccess: handleUpdateBillSuccess,
    onError: handleUpdateBillError
  })

  function handleUpdateBillSuccess(data: any) {
    if (data?.bill) {
      handleReset()
      router.back()
      toast.success(data?.message || 'Bill updated successfully')
    }
  }

  function handleUpdateBillError(error: any) {
    setIsLoading(false)

    if (error.response.data.error)
      toast.error(error.response.data.error || 'Oops! something went wrong.please try again')
  }

  return (
    <div>
      <Spinner open={getBillbyId?.isFetching || isLoading} />

      <FormProvider {...methods}>
        <Grid container spacing={6}>
          <Grid item xs={12} md={9}>
            <Card>
              <CardContent className='sm:!p-12 '>
                <Grid container spacing={6}>
                  <Grid item xs={12}>
                    <div className='flex justify-between flex-col gap-4 flex-wrap sm:flex-row'>
                      <div className='flex flex-col gap-4 sm:min-w-56'>
                        <Typography className='font-medium' color='text.primary'>
                          Bill To Vendor :{' '}
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
                          name={`vendor`}
                          rules={{ required: true }}
                          render={({ field: { onChange, value, onBlur } }) => (
                            <CustomAutocomplete
                              className={classnames('min-is-[220px]', { 'is-1/2': isBelowSmScreen })}
                              onChange={(event, item) => {
                                onChange(item)
                              }}
                              onBlur={onBlur}
                              value={value}
                              inputValue={vendorInput}
                              onInputChange={(event, value) => {
                                setVendorInput(value)
                              }}
                              options={vendorSearchData?.data?.vendors.map((item: Vendor) => item) || []}
                              getOptionLabel={item => item.name}
                              isOptionEqualToValue={(option, value) =>
                                value?._id === undefined || value?._id === '' || option?._id === value?._id
                              }
                              renderInput={params => (
                                <CustomTextField
                                  {...params}
                                  placeholder='e.g john'
                                  error={Boolean(errors.vendor?.name)}
                                  {...(errors?.vendor?.name && { helperText: errors?.vendor?.name?.message })}
                                />
                              )}
                            />
                          )}
                        />

                        <div>
                          <Typography>{getValues('vendor.name')}</Typography>
                          <Typography>{getValues('vendor.address')}</Typography>
                          <Typography>{getValues('vendor.phone_no')}</Typography>
                          <Typography>{getValues('vendor.email')}</Typography>
                        </div>
                      </div>

                      <div className='sm:self-center flex flex-col gap-5'>
                        <Controller
                          name='bill_date'
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
                              autoComplete='off'
                              customInput={
                                <CustomTextField
                                  autoComplete='off'
                                  fullWidth
                                  label='Bill Date *'
                                  error={Boolean(errors.bill_date)}
                                  {...(errors.bill_date && { helperText: errors.bill_date.message })}
                                />
                              }
                            />
                          )}
                        />

                        <FileUploader
                          onDrop={onDrop}
                          files={files}
                          required
                          helperText={FileError}
                          title='Drop or upload bill image'
                        />
                      </div>
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
                              Raw Item{' '}
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
                              name={`raw_items.${index}.sku`}
                              rules={{ required: true }}
                              render={({ field: { onChange, value } }) => (
                                <CustomAutocomplete
                                  fullWidth
                                  onChange={(event, item) => {
                                    onChange(item)
                                  }}
                                  value={value}
                                  options={data?.rawItems?.map((item: RawItems) => item?.sku) || []}
                                  getOptionLabel={item => item}
                                  isOptionEqualToValue={(option, value) =>
                                    value === undefined || value === '' || option === value
                                  }
                                  renderInput={params => (
                                    <CustomTextField
                                      {...params}
                                      error={Boolean(errors.raw_items?.[index]?.sku)}
                                      {...(errors.raw_items?.[index]?.sku && {
                                        helperText: errors.raw_items?.[index]?.sku?.message
                                      })}
                                    />
                                  )}
                                />
                              )}
                            />
                          </Grid>

                          <Grid item lg={2} md={3} xs={12}>
                            <Typography className='font-medium md:absolute md:-top-8'>
                              Cost{' '}
                              <span
                                style={{
                                  color: theme.palette.error.light
                                }}
                              >
                                *
                              </span>
                            </Typography>

                            <Controller
                              name={`raw_items.${index}.cost`}
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
                                  error={Boolean(errors?.raw_items?.[index]?.cost)}
                                  {...(errors?.raw_items?.[index]?.cost && {
                                    helperText: errors?.raw_items?.[index]?.cost?.message
                                  })}
                                />
                              )}
                            />
                          </Grid>

                          <Grid item md={2} xs={12}>
                            <Typography className='font-medium md:absolute md:-top-8'>
                              Total Qty{' '}
                              <span
                                style={{
                                  color: theme.palette.error.light
                                }}
                              >
                                *
                              </span>
                            </Typography>

                            <Controller
                              name={`raw_items.${index}.qty`}
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
                                  error={Boolean(errors?.raw_items?.[index]?.qty)}
                                  {...(errors?.raw_items?.[index]?.qty && {
                                    helperText: errors?.raw_items?.[index]?.qty?.message
                                  })}
                                />
                              )}
                            />
                          </Grid>

                          <Grid item md={2} xs={12}>
                            <Typography className='font-medium md:absolute md:-top-8'>Total Cost</Typography>
                            <Typography className='pt-[12px]'>
                              {watch(`raw_items.${index}.qty`)! * watch(`raw_items.${index}.cost`)! > 0
                                ? `${watch(`raw_items.${index}.qty`)! * watch(`raw_items.${index}.cost`)!} Rs`
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
                        onClick={() => insert(fields.length + 1, { sku: '', qty: 0, cost: 0 })}
                        startIcon={<i className='tabler-plus' />}
                      >
                        Add Raw Item
                      </Button>
                    </Grid>

                    <FormHelperText
                      sx={{
                        color: theme.palette.error.main,
                        fontSize: theme.typography.body2.fontSize,
                        mt: '10px'
                      }}
                    >
                      {errors.raw_items && (errors.raw_items?.message || errors?.raw_items?.root?.message)}
                    </FormHelperText>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider className='border-dashed' />
                  </Grid>

                  <Grid item xs={12}>
                    {ingredientFields?.map((item, index) => (
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
                              Ingredient{' '}
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
                              name={`ingredients.${index}.sku`}
                              rules={{ required: true }}
                              render={({ field: { onChange, value } }) => (
                                <CustomAutocomplete
                                  fullWidth
                                  onChange={(event, item) => {
                                    onChange(item)
                                  }}
                                  value={value}
                                  options={
                                    searchIngredientData?.data?.ingredients?.map((item: Ingredient) => item?.sku) || []
                                  }
                                  getOptionLabel={item => item}
                                  isOptionEqualToValue={(option, value) =>
                                    value === undefined || value === '' || option === value
                                  }
                                  renderInput={params => (
                                    <CustomTextField
                                      {...params}
                                      error={Boolean(errors.ingredients?.[index]?.sku)}
                                      {...(errors.ingredients?.[index]?.sku && {
                                        helperText: errors.ingredients?.[index]?.sku?.message
                                      })}
                                    />
                                  )}
                                />
                              )}
                            />
                          </Grid>

                          <Grid item lg={2} md={3} xs={12}>
                            <Typography className='font-medium md:absolute md:-top-8'>
                              Cost{' '}
                              <span
                                style={{
                                  color: theme.palette.error.light
                                }}
                              >
                                *
                              </span>
                            </Typography>

                            <Controller
                              name={`ingredients.${index}.cost`}
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
                                  error={Boolean(errors?.ingredients?.[index]?.cost)}
                                  {...(errors?.ingredients?.[index]?.cost && {
                                    helperText: errors?.ingredients?.[index]?.cost?.message
                                  })}
                                />
                              )}
                            />
                          </Grid>

                          <Grid item md={2} xs={12}>
                            <Typography className='font-medium md:absolute md:-top-8'>
                              Total Qty{' '}
                              <span
                                style={{
                                  color: theme.palette.error.light
                                }}
                              >
                                *
                              </span>
                            </Typography>

                            <Controller
                              name={`ingredients.${index}.qty`}
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
                                  error={Boolean(errors?.ingredients?.[index]?.qty)}
                                  {...(errors?.ingredients?.[index]?.qty && {
                                    helperText: errors?.ingredients?.[index]?.qty?.message
                                  })}
                                />
                              )}
                            />
                          </Grid>

                          <Grid item md={2} xs={12}>
                            <Typography className='font-medium md:absolute md:-top-8'>Total Cost</Typography>
                            <Typography className='pt-[12px]'>
                              {watch(`ingredients.${index}.qty`)! * watch(`ingredients.${index}.cost`)! > 0
                                ? `${watch(`ingredients.${index}.qty`)! * watch(`ingredients.${index}.cost`)!} Rs`
                                : 0}
                            </Typography>
                          </Grid>
                        </Grid>

                        <div className='flex flex-col justify-center border-is'>
                          <IconButton size='small' onClick={() => ingredientRemove(index)}>
                            <i className='tabler-x text-actionActive' />
                          </IconButton>
                        </div>
                      </div>
                    ))}

                    <Grid item xs={12}>
                      <Button
                        size='small'
                        variant='contained'
                        onClick={() => ingredientInsert(ingredientFields.length + 1, { sku: '', qty: 0, cost: 0 })}
                        startIcon={<i className='tabler-plus' />}
                      >
                        Add Ingredient
                      </Button>
                    </Grid>

                    <FormHelperText
                      sx={{
                        color: theme.palette.error.main,
                        fontSize: theme.typography.body2.fontSize,
                        mt: '10px'
                      }}
                    >
                      {errors.ingredients && (errors.ingredients?.message || errors?.ingredients?.root?.message)}
                    </FormHelperText>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider className='border-dashed' />
                  </Grid>
                  <Grid item xs={12}>
                    <div className='flex justify-end flex-col gap-4 sm:flex-row'>
                      <div className='min-is-[200px]'>
                        <div className='flex items-center justify-between'>
                          <Typography>Total bill cost:</Typography>
                          <Typography className='font-medium' color='text.primary'>
                            {getTotalCost(rawItems, ingredients) > 0 ? `${getTotalCost(rawItems, ingredients)} Rs` : 0}
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

export default BillAddAndEditCard
