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
import { AdminClaimService, AdminProductService, AdminDistributorService } from '@/services'

import type { Product } from '@/types/product'
import type { Claim, ClaimItems } from '@/types/claim'
import type { Distributor } from '@/types/distributor'
import Spinner from './Spinner'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { validateUniqueSKU } from '@/helpers/uniqueSku'

const productSchema = yup
  .array(
    yup.object({
      sku: yup.string().required('Product is required.'),
      qty: yup
        .number()
        .transform(value => (Number.isNaN(value) ? null : value))
        .positive('It must be positive')
        .nonNullable('Quantity cannot be null'),
      cost: yup
        .number()
        .transform(value => (Number.isNaN(value) ? null : value))
        .positive('It must be positive')
        .nonNullable('Cost cannot be null')
    })
  )
  .test('unique', 'Duplicate sku are not allowed', validateUniqueSKU)
  .required('Atleast one product is required.')

const schema = yup.object().shape({
  distributor: yup.object({
    _id: yup.string().required(),
    name: yup.string().required('Distributor is required')
  }),
  products: productSchema.min(1, 'Atleast one product is required.'),
  claimed_at: yup.string().required('Claimed date is required'),
  note: yup.string()
})

const ClaimAddAndEditCard = ({ params }: { params?: { claimId: string } }) => {
  // States

  const [isLoading, setIsLoading] = useState(false)
  const [distributorInput, setDistributorInput] = useState('')

  //hooks
  const methods = useForm()
  const theme = useTheme()
  const router = useRouter()
  const ProductSearch = useDebounce('')
  const distributorSearch = useDebounce(distributorInput)
  const isBelowMdScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))
  const isBelowSmScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
  const claimId = params?.claimId

  // use Query for getting Claim data by id when updating

  const getClaimbyId = useQuery({
    queryKey: [`Claims/edit/${claimId}`, claimId],
    queryFn: () => AdminClaimService.getClaimById(claimId),
    enabled: Boolean(claimId)
  })

  const claimDistributor: Claim = getClaimbyId?.data?.data?.claim || {}
  const claimProduct: ClaimItems[] = getClaimbyId?.data?.data?.claimItems || [{}]

  const values = {
    distributor: claimDistributor
      ? {
          name: claimDistributor?.distributor?.name || '',
          _id: claimDistributor?.distributor?._id || ''
        }
      : { name: '', _id: '' },
    products: claimProduct
      ? claimProduct?.map(item => ({
          sku: item?.product?.sku || '',
          qty: item?.qty || 0,
          cost: item?.cost || 0
        })) || [{ sku: '', qty: 0, cost: 0 }]
      : [{ sku: '', qty: 0, cost: 0 }],

    note: claimDistributor ? claimDistributor?.note || '' : '',
    claimed_at: claimDistributor ? claimDistributor?.claimed_at || '' : ''
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
  const totalCost = rawItems.reduce((acc, item) => {
    const itemCost = item.qty! * item.cost!

    return acc + (itemCost || 0)
  }, 0)

  // Process form data here
  const onSubmit = (data: Claim) => {
    const { distributor, products, note, claimed_at } = data

    setIsLoading(true)

    if (claimId)
      updateClaimMutation.mutate({
        _id: claimId,
        distributorId: distributor?._id,
        products: products,
        total_cost: totalCost,
        note,
        claimed_at
      })
    else
      addClaimMutation.mutate({
        distributorId: distributor?._id,
        products: products,
        total_cost: totalCost,
        note,
        claimed_at
      })
  }

  //use Query for Product searching
  const { data, error, isError } = useQuery({
    queryKey: ['productSearchForClaim', ProductSearch],
    queryFn: () => AdminProductService.searchProducts(ProductSearch)
  })

  if (isError) toast.error(error.message || 'Oops! something went wrong')

  //use Query for distributor searching
  const distributorSearchData = useQuery({
    queryKey: ['distributorSearchForClaim', distributorSearch],
    queryFn: () => AdminDistributorService.searchDistributor(distributorSearch)
  })

  if (isError) toast.error(error.message || 'Oops! something went wrong')

  // Reset function
  const handleReset = () => {
    reset()
    setIsLoading(false)
  }

  //Add Claim mutation
  const addClaimMutation = useMutation({
    mutationFn: AdminClaimService.addClaim,
    onSuccess: handleAddClaimSuccess,
    onError: handleAddClaimError
  })

  function handleAddClaimSuccess(data: any) {
    if (data?.claim) {
      handleReset()
      toast.success(data?.message || 'Claim created successfully')
    }
  }

  function handleAddClaimError(error: any) {
    setIsLoading(false)

    if (error.response.data.error)
      toast.error(error.response.data.error || 'Oops! something went wrong.please try again')
  }

  //Update Claim mutation
  const updateClaimMutation = useMutation({
    mutationFn: AdminClaimService.updateClaim,
    onSuccess: handleUpdateClaimSuccess,
    onError: handleUpdateClaimError
  })

  function handleUpdateClaimSuccess(data: any) {
    if (data?.claim) {
      handleReset()
      router.back()
      toast.success(data?.message || 'Claim updated successfully')
    }
  }

  function handleUpdateClaimError(error: any) {
    setIsLoading(false)

    if (error.response.data.error)
      toast.error(error.response.data.error || 'Oops! something went wrong.please try again')
  }

  return (
    <div>
      <Spinner open={getClaimbyId?.isFetching || isLoading} />

      <FormProvider {...methods}>
        <Grid container spacing={6}>
          <Grid item xs={12} md={9}>
            <Card>
              <CardContent className='sm:!p-12 '>
                <Grid container spacing={6}>
                  <Grid item xs={12} md={6} lg={4}>
                    <Controller
                      control={control}
                      name={`distributor`}
                      rules={{ required: true }}
                      render={({ field: { onChange, value, onBlur } }) => (
                        <CustomAutocomplete
                          className={classnames('min-is-full', { 'is-1/2': isBelowSmScreen })}
                          onChange={(event, item) => {
                            onChange(item)
                          }}
                          onBlur={onBlur}
                          value={value}
                          inputValue={distributorInput}
                          onInputChange={(event, value) => {
                            setDistributorInput(value)
                          }}
                          options={distributorSearchData?.data?.distributors.map((item: Distributor) => item) || []}
                          getOptionLabel={item => item.name}
                          isOptionEqualToValue={(option, value) =>
                            value?._id === undefined || value?._id === '' || option?._id === value?._id
                          }
                          renderInput={params => (
                            <CustomTextField
                              {...params}
                              placeholder='e.g john'
                              label='Claimed By'
                              required
                              error={Boolean(errors.distributor?.name)}
                              {...(errors.distributor?.name && {
                                helperText: errors.distributor?.name?.message
                              })}
                            />
                          )}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6} lg={4}>
                    <Controller
                      name='claimed_at'
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
                              label='Claimed At *'
                              autoComplete='Off'
                              error={Boolean(errors.claimed_at)}
                              {...(errors.claimed_at && { helperText: errors.claimed_at.message })}
                            />
                          }
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6} lg={4}>
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
                          fullWidth
                          value={value}
                          onBlur={onBlur}
                          onChange={onChange}
                          error={Boolean(errors.note)}
                          {...(errors.note && { helperText: errors.note.message })}
                        />
                      )}
                    />
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
                              name={`products.${index}.qty`}
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
                                  error={Boolean(errors?.products?.[index]?.qty)}
                                  {...(errors?.products?.[index]?.qty && {
                                    helperText: errors?.products?.[index]?.qty?.message
                                  })}
                                />
                              )}
                            />
                          </Grid>

                          <Grid item md={2} xs={12}>
                            <Typography className='font-medium md:absolute md:-top-8'>Total Cost</Typography>
                            <Typography className='pt-[12px]'>
                              {watch(`products.${index}.qty`)! * watch(`products.${index}.cost`)! > 0
                                ? `${watch(`products.${index}.qty`)! * watch(`products.${index}.cost`)!} Rs`
                                : 0}
                            </Typography>
                          </Grid>
                        </Grid>

                        <div className='flex flex-col justify-center border-is'>
                          <IconButton
                            size='small'
                            onClick={() => {
                              remove(index)
                            }}
                          >
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
                      {errors.products && (errors.products?.message || errors?.products?.root?.message)}
                    </FormHelperText>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider className='border-dashed' />
                  </Grid>
                  <Grid item xs={12}>
                    <div className='flex justify-end flex-col gap-4 sm:flex-row'>
                      <div className='min-is-[200px]'>
                        <div className='flex items-center justify-between'>
                          <Typography>Total claim cost:</Typography>
                          <Typography className='font-medium' color='text.primary'>
                            {totalCost > 0 ? `${totalCost} Rs` : 0}
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

export default ClaimAddAndEditCard
