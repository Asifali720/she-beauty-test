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
import type { Theme } from '@mui/material/styles'

// Third-party Imports
import classnames from 'classnames'

import { Controller, FormProvider, useFieldArray, useForm } from 'react-hook-form'

import * as yup from 'yup'

import { yupResolver } from '@hookform/resolvers/yup'

import { FormHelperText, useTheme } from '@mui/material'

import { useMutation, useQuery } from '@tanstack/react-query'

import { toast } from 'react-toastify'

import CustomTextField from '@core/components/mui/TextField'
import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
import { AddActions, FileUploader, Spinner } from '.'
import { AdminProductService, AdminRawItemsService } from '@/services'
import type { RawItems } from '@/types/rawItems'
import { useDebounce } from '@/@core/hooks/useDebounce'
import type { Product } from '@/types/product'
import { NAME_REGX } from '@/utils/emailRegex'
import { validateUniqueSKU } from '@/helpers/uniqueSku'

const rawItemSchema = yup
  .array(
    yup.object({
      raw_item: yup.string().nonNullable('Raw item cannot be null'),
      quantity: yup
        .number()
        .nonNullable('Quantity cannot be null')
        .transform(value => (Number.isNaN(value) ? null : value))
        .positive('It must be positive')
    })
  )
  .test('unique', 'Duplicate raw items are not allowed', validateUniqueSKU)
  .required('Atleast one raw item is required.')

const schema = yup.object().shape({
  name: yup.string().matches(NAME_REGX, 'Only alphabetic characters allowed').required('Name is required.'),
  sku: yup
    .string()
    .matches(/^[a-zA-Z0-9\-]+(?:['\s\-][a-zA-Z0-9\-]+)*$/, 'Please dont use special characters except hypens')
    .required('Sku is required.'),
  price: yup
    .number()
    .transform(value => (Number.isNaN(value) ? null : value))
    .positive('It must be positive')
    .nonNullable()
    .required('Cost is required.'),
  raw_items: rawItemSchema.min(1, 'Atleast one raw item is required.')
})

const ProductAddAndEditCard = ({ params }: { params?: { productId: string } }) => {
  // States
  const [files, setFiles] = useState<File[]>()
  const [FileError, setFileError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  //hooks
  const methods = useForm()
  const theme = useTheme()
  const router = useRouter()
  const debounceSearch = useDebounce('')
  const isBelowMdScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))

  const productId = params?.productId

  //use Query for getting product data by id when editing
  const getProductbyId = useQuery({
    queryKey: [`products/edit/${productId}`, productId],
    queryFn: () => AdminProductService.getProductById(productId),
    enabled: Boolean(productId)
  })

  const productData: Product = getProductbyId?.data?.data?.product || {}

  useEffect(() => {
    if (params?.productId && productData?.photo) {
      setFiles(productData?.photo)
    }
  }, [params?.productId, productData?.photo])

  const values = {
    name: productData ? productData?.name || '' : '',
    sku: productData ? productData?.sku || '' : '',
    raw_items: productData
      ? productData?.raw_items?.map(item => ({ raw_item: item?.raw_item?.sku, quantity: item?.quantity })) || [
          { raw_item: '', quantity: 0 }
        ]
      : [{ raw_item: '', quantity: 0 }],
    price: productData ? productData?.price || 0 : 0
  }

  //hooks
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    values,
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  const { fields, insert, remove } = useFieldArray({
    control,
    name: 'raw_items'
  })

  // Process form data here
  const onSubmit = (data: any) => {
    const { name, sku, price, raw_items } = data

    if (productId) {
      if (!files) setFileError('Image is required')
      else {
        setIsLoading(true)
        updateProductMutation.mutate({ name, _id: productId, raw_items, photo: files || productData?.photo, price })
      }
    } else {
      if (!files) setFileError('Image is required')
      else {
        setIsLoading(true)
        addProductMutation.mutate({ name, sku, photo: files, price, raw_items })
      }
    }
  }

  // function to drop or select image
  const onDrop = (acceptedFiles: File[]) => {
    setFiles(acceptedFiles.map((file: File) => file))
  }

  //use Query for rawitems searching
  const { data, error, isError } = useQuery({
    queryKey: ['rawItemsSearchForProduct', debounceSearch],
    queryFn: () => AdminRawItemsService.searchRawItems(debounceSearch)
  })

  if (isError) toast.error(error.message || 'Oops! something went wrong')

  // Reset function
  const handleReset = () => {
    reset()
    setFiles(undefined)
    setFileError('')
    setIsLoading(false)
  }

  //Add Product mutation
  const addProductMutation = useMutation({
    mutationFn: AdminProductService.addProduct,
    onSuccess: handleAddProductSuccess,
    onError: handleAddProductError
  })

  function handleAddProductSuccess(data: any) {
    if (data?.product) {
      handleReset()
      toast.success(data?.message || 'Product created successfully')
    }
  }

  function handleAddProductError(error: any) {
    setIsLoading(false)

    if (error.response.data.error)
      toast.error(error.response.data.error || 'Oops! something went wrong.please try again')
  }

  //Update Product mutation
  const updateProductMutation = useMutation({
    mutationFn: AdminProductService.updateProduct,
    onSuccess: handleUpdateProductSuccess,
    onError: handleUpdateProductError
  })

  function handleUpdateProductSuccess(data: any) {
    if (data?.product) {
      handleReset()
      router.back()
      toast.success(data?.message || 'Product updated successfully')
    }
  }

  function handleUpdateProductError(error: any) {
    setIsLoading(false)

    if (error.response.data.error)
      toast.error(error.response.data.error || 'Oops! something went wrong.please try again')
  }

  return (
    <div>
      <Spinner open={getProductbyId?.isFetching || isLoading} />
      <FormProvider {...methods}>
        <Grid container spacing={6}>
          <Grid item xs={12} md={9}>
            <Card>
              <CardContent className='sm:!p-12'>
                <Grid container spacing={6}>
                  <Grid item xs={12}>
                    <div className='p-6 bg-actionHover rounded'>
                      <div className='flex justify-between gap-4 flex-col sm:flex-row'>
                        <FileUploader
                          onDrop={onDrop}
                          files={files}
                          helperText={FileError}
                          title='Drop or upload product image'
                          required
                        />

                        <div className='flex flex-col gap-2'>
                          <div className='flex items-center  '>
                            <Typography variant='h5' className='min-is-[50px] mie-4'>
                              Name:
                              <span
                                style={{
                                  color: theme.palette.error.light
                                }}
                              >
                                *
                              </span>
                            </Typography>

                            <Controller
                              name='name'
                              control={control}
                              rules={{
                                required: true
                              }}
                              render={({ field: { value, onChange, onBlur } }) => (
                                <CustomTextField
                                  fullWidth
                                  placeholder='Name'
                                  value={value}
                                  onBlur={onBlur}
                                  required
                                  onChange={onChange}
                                  error={Boolean(errors.name)}
                                  {...(errors.name && { helperText: errors.name.message })}
                                />
                              )}
                            />
                          </div>
                          <div className='flex items-center'>
                            <Typography className='min-is-[50px] mie-4' variant='h5'>
                              SKU:
                              <span
                                style={{
                                  color: theme.palette.error.light
                                }}
                              >
                                *
                              </span>
                            </Typography>

                            <Controller
                              name='sku'
                              control={control}
                              rules={{
                                required: true
                              }}
                              render={({ field: { value, onChange, onBlur } }) => (
                                <CustomTextField
                                  fullWidth
                                  placeholder='SKU'
                                  value={value}
                                  disabled={Boolean(productId)}
                                  onBlur={onBlur}
                                  required
                                  onChange={onChange}
                                  error={Boolean(errors.sku)}
                                  {...(errors.sku && { helperText: errors.sku.message })}
                                />
                              )}
                            />
                          </div>
                          <div className='flex items-center'>
                            <Typography className='min-is-[50px] mie-4' variant='h5'>
                              Price:
                              <span
                                style={{
                                  color: theme.palette.error.light
                                }}
                              >
                                *
                              </span>
                            </Typography>

                            <Controller
                              name='price'
                              control={control}
                              rules={{
                                required: true
                              }}
                              render={({ field: { value, onChange, onBlur } }) => (
                                <CustomTextField
                                  fullWidth
                                  placeholder='Price'
                                  type='number'
                                  required
                                  value={value}
                                  onBlur={onBlur}
                                  onChange={onChange}
                                  error={Boolean(errors.price)}
                                  {...(errors.price && { helperText: errors.price.message })}
                                />
                              )}
                            />
                          </div>
                        </div>
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
                              name={`raw_items.${index}.raw_item`}
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
                                  renderInput={params => <CustomTextField {...params} required />}
                                />
                              )}
                            />

                            <FormHelperText
                              sx={{
                                color: theme.palette.error.main,
                                fontSize: theme.typography.body2.fontSize
                              }}
                            >
                              {errors.raw_items?.[index]?.raw_item && errors.raw_items?.[index]?.raw_item?.message}
                            </FormHelperText>
                          </Grid>

                          <Grid item md={2} xs={12}>
                            <Typography className='font-medium md:absolute md:-top-8'>
                              Allocate Qty{' '}
                              <span
                                style={{
                                  color: theme.palette.error.light
                                }}
                              >
                                *
                              </span>
                            </Typography>

                            <Controller
                              name={`raw_items.${index}.quantity`}
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
                                  required
                                  onBlur={onBlur}
                                  onChange={onChange}
                                  error={Boolean(errors?.raw_items?.[index]?.quantity)}
                                  {...(errors?.raw_items?.[index]?.quantity && {
                                    helperText: errors?.raw_items?.[index]?.quantity?.message
                                  })}
                                />
                              )}
                            />
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
                        onClick={() => insert(fields.length + 1, { raw_item: '', quantity: 0 })}
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

export default ProductAddAndEditCard
