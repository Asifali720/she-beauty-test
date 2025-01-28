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
import { AdminInvoiceService, AdminProductService, AdminDistributorService } from '@/services'

import type { Product } from '@/types/product'
import type { Invoice, InvoiceItems } from '@/types/invoice'
import type { Distributor } from '@/types/distributor'
import Spinner from './Spinner'
import { validateUniqueSKU } from '@/helpers/uniqueSku'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { addInvoice, getSingleInvoiceData, updateInvoice } from '@/services/admin-invoice-service'
import { invoicePdfHtmlTemplate } from '@/frontend-pdf-templates/invoicePdfHtmlTemplate'
import html2pdf from 'html2pdf.js'

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
    name: yup.string().required('Distributor is required'),
    phone_no: yup.string().optional().nullable(),
    address: yup.string().optional().nullable(),
    email: yup.string().optional().nullable()
  }),
  due_date: yup.string().required('Due date is required'),
  invoice_date: yup.string().required('Invoice date is required'),
  products: productSchema.min(1, 'Atleast one product is required.'),
  discount: yup
    .number()
    .transform(value => (Number.isNaN(value) ? null : value))
    .positive('It must be positive')
})

const InvoiceAddAndEditCard = ({ params }: { params?: { invoiceId: string } }) => {
  // States

  const [isLoading, setIsLoading] = useState(false)
  const [distributorInput, setDistributorInput] = useState('')
  const [discountValue, setDiscountValue] = useState<Number>(0)

  //hooks
  const methods = useForm()
  const theme = useTheme()
  const router = useRouter()
  const ProductSearch = useDebounce('')
  const distributorSearch = useDebounce(distributorInput)
  const isBelowMdScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))
  const isBelowSmScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
  const invoiceId = params?.invoiceId

  // use Query for getting Invoice data by id when updating

  const getInvoicebyId = useQuery({
    queryKey: [`Invoices/edit/${invoiceId}`, invoiceId],
    queryFn: () => AdminInvoiceService.getInvoiceById(invoiceId),
    enabled: Boolean(invoiceId)
  })

  const invoiceDistributor: Invoice = getInvoicebyId?.data?.data?.invoice || {}
  const invoiceProduct: InvoiceItems[] = getInvoicebyId?.data?.data?.invoiceItems || [{}]

  const values = {
    distributor: invoiceDistributor
      ? {
          name: invoiceDistributor?.distributor?.name || '',
          _id: invoiceDistributor?.distributor?._id || '',
          phone_no: invoiceDistributor?.distributor?.phone_no || '',
          address: invoiceDistributor?.distributor?.address || '',
          email: invoiceDistributor?.distributor?.email || ''
        }
      : { name: '', _id: '', phone_no: '', address: '', email: '' },
    products: invoiceProduct
      ? invoiceProduct?.map(item => ({
          sku: item?.product?.sku || '',
          qty: item?.qty || 0,
          cost: item?.cost || 0
        })) || [{ sku: '', qty: 0, cost: 0 }]
      : [{ sku: '', qty: 0, cost: 0 }],
    due_date: invoiceDistributor?.due_date ? invoiceDistributor?.due_date || '' : '',
    invoice_date: invoiceDistributor?.invoice_date ? invoiceDistributor?.invoice_date || '' : '',
    discount: invoiceDistributor?.discount
  }

  //hooks
  const {
    control,
    handleSubmit,
    reset,
    watch,
    getValues,
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
  const onSubmit = (data: Invoice) => {
    const { distributor, products, due_date, invoice_date, discount } = data
    setIsLoading(true)

    if (invoiceId)
      updateInvoiceMutation.mutate({
        _id: invoiceId,
        distributorId: distributor?._id,
        products: products,
        totalCost: totalCost,
        due_date,
        invoice_date,
        discount
      })
    else
      addInvoiceMutation.mutate({
        distributorId: distributor?._id,
        products: products,
        totalCost: totalCost,
        due_date,
        invoice_date,
        discount
      })
  }

  const onSubmitAndSavePdf = async (data: Invoice) => {
    try {
      const { distributor, products, due_date, invoice_date, discount } = data
      if (invoiceId) {
        setIsLoading(true)
        const res = await updateInvoice({
          _id: invoiceId,
          distributorId: distributor?._id,
          products: products,
          totalCost: totalCost,
          due_date,
          invoice_date,
          discount
        })
        const response = await getSingleInvoiceData(res?.invoice?._id)
        const options = {
          filename: 'Invoice.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 4 },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        }
        const htmlContent = invoicePdfHtmlTemplate({
          distributor: response?.data?.data?.distributor,
          invoice: response?.data?.data?.invoice,
          invoiceItems: response?.data?.data?.invoiceItems,
          invoiceTotal: response?.data?.data?.invoiceTotal,
          discount: response?.data?.data?.invoice?.discount
        })
        html2pdf()
          .from(htmlContent)
          .set(options)
          .toPdf()
          .get('pdf')
          .then((pdf: any) => {
            pdf.save(`${response?.data?.data?.distributor?.name}.pdf`)
          })
        toast.success('Invoice updated successfully')
        setIsLoading(false)
      } else {
        setIsLoading(true)
        const res = await addInvoice({
          distributorId: distributor?._id,
          products: products,
          totalCost: totalCost,
          due_date,
          invoice_date,
          discount
        })
        const response = await getSingleInvoiceData(res?.invoice?._id)
        const options = {
          filename: 'Invoice.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 4 },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        }
        const htmlContent = invoicePdfHtmlTemplate({
          distributor: response?.data?.data?.distributor,
          invoice: response?.data?.data?.invoice,
          invoiceItems: response?.data?.data?.invoiceItems,
          invoiceTotal: response?.data?.data?.invoiceTotal,
          discount: response?.data?.data?.invoice?.discount
        })
        html2pdf()
          .from(htmlContent)
          .set(options)
          .toPdf()
          .get('pdf')
          .then((pdf: any) => {
            pdf.save(`${response?.data?.data?.distributor?.name}.pdf`)
          })
        toast.success('Invoice created successfully')
        setIsLoading(false)
      }
    } catch (error: any) {
      console.log('🚀 ~ onSubmitAndSavePdf ~ error:', error)
    }
  }

  //use Query for Product searching
  const { data, error, isError } = useQuery({
    queryKey: ['productSearchForInvoice', ProductSearch],
    queryFn: () => AdminProductService.searchProducts(ProductSearch)
  })

  if (isError) toast.error(error.message || 'Oops! something went wrong')

  //use Query for distributor searching
  const distributorSearchData = useQuery({
    queryKey: ['distributorSearchForInvoice', distributorSearch],
    queryFn: () => AdminDistributorService.searchDistributor(distributorSearch)
  })

  if (isError) toast.error(error.message || 'Oops! something went wrong')

  // Reset function
  const handleReset = () => {
    reset()
    setIsLoading(false)
  }

  //Add Invoice mutation
  const addInvoiceMutation = useMutation({
    mutationFn: AdminInvoiceService.addInvoice,
    onSuccess: handleAddInvoiceSuccess,
    onError: handleAddInvoiceError
  })

  function handleAddInvoiceSuccess(data: any) {
    if (data?.invoice) {
      handleReset()
      toast.success(data?.message || 'Invoice created successfully')
    }
  }

  function handleAddInvoiceError(error: any) {
    setIsLoading(false)

    if (error.response.data.error)
      toast.error(error.response.data.error || 'Oops! something went wrong.please try again')
  }

  //Update Invoice mutation
  const updateInvoiceMutation = useMutation({
    mutationFn: AdminInvoiceService.updateInvoice,
    onSuccess: handleUpdateInvoiceSuccess,
    onError: handleUpdateInvoiceError
  })

  function handleUpdateInvoiceSuccess(data: any) {
    if (data?.invoice) {
      handleReset()
      router.back()
      toast.success(data?.message || 'Invoice updated successfully')
    }
  }

  function handleUpdateInvoiceError(error: any) {
    setIsLoading(false)

    if (error.response.data.error)
      toast.error(error.response.data.error || 'Oops! something went wrong.please try again')
  }

  return (
    <div>
      <Spinner open={getInvoicebyId?.isFetching || isLoading} />

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
                          Invoice To Distributor:{' '}
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
                          name={`distributor`}
                          rules={{ required: true }}
                          render={({ field: { onChange, value, onBlur } }) => (
                            <CustomAutocomplete
                              className={classnames('min-is-[220px]', { 'is-1/2': isBelowSmScreen })}
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
                                  error={Boolean(errors.distributor?.name)}
                                  {...(errors.distributor?.name && {
                                    helperText: errors.distributor?.name?.message
                                  })}
                                />
                              )}
                            />
                          )}
                        />

                        <div>
                          <Typography>{getValues('distributor.name')}</Typography>
                          <Typography>{getValues('distributor.address')}</Typography>
                          <Typography>{getValues('distributor.phone_no')}</Typography>
                          <Typography>{getValues('distributor.email')}</Typography>
                        </div>
                      </div>

                      <div className='sm:self-center flex flex-col gap-5'>
                        <Controller
                          name='invoice_date'
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
                                  label='Invoice Date *'
                                  error={Boolean(errors.invoice_date)}
                                  {...(errors.invoice_date && { helperText: errors.invoice_date.message })}
                                />
                              }
                            />
                          )}
                        />

                        <Controller
                          name='due_date'
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
                                  label='Due Date *'
                                  error={Boolean(errors.due_date)}
                                  {...(errors.due_date && { helperText: errors.due_date.message })}
                                />
                              }
                            />
                          )}
                        />
                        <Controller
                          name={'discount'}
                          control={control}
                          rules={{
                            required: true
                          }}
                          render={({ field: { value, onChange, onBlur } }) => {
                            setDiscountValue(value as any)
                            return (
                              <div>
                                <Typography className='font-medium' color='text.primary'>
                                  Discount
                                  {/* <span
                                  	style={{
                                    	color: theme.palette.error.light
                                  	}}
                                	>
                                  	*
                                	</span> */}
                                </Typography>
                                <CustomTextField
                                  {...(isBelowMdScreen && { fullWidth: true })}
                                  type='number'
                                  placeholder='0'
                                  value={value ? value : ''}
                                  onBlur={onBlur}
                                  className='mbe-5'
                                  onChange={onChange}
                                />
                              </div>
                            )
                          }}
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
                        <div className='flex items-center gap-4 justify-between'>
                          <Typography>Sub Total invoice cost:</Typography>
                          <Typography className='font-medium' color='text.primary'>
                            {totalCost > 0 ? `${totalCost} Rs` : 0}
                          </Typography>
                        </div>
                        <div className='flex items-center justify-between'>
                          <Typography>Total invoice cost:</Typography>
                          <Typography className='font-medium' color='text.primary'>
                            {totalCost > 0 ? `${totalCost - (discountValue || 0)} Rs` : 0}
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
            <AddActions onSubmit={handleSubmit(onSubmit)} onSubmitAndSavePdf={handleSubmit(onSubmitAndSavePdf)} />
          </Grid>
        </Grid>
      </FormProvider>
    </div>
  )
}

export default InvoiceAddAndEditCard
