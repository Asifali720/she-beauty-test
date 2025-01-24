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
import SheBeautyLogo from '../../assets/images/she-beauty-logo.png'

// Component Imports
import { MenuItem } from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'
import { CustomDateRangePicker, Spinner } from '.'
import { AdminLedgerService } from '@/services'
import { EMAIL_REGX } from '@/utils/emailRegex'
import type { DateRange } from '@/types/date'
import type { DistributorLedger } from '@/types/ledger'
import { exportDistributorLedger, sendLegderAndVendorReportPdfEmail } from '@/services/admin-ledger-service'
import { ledgerDistributorPdfHtmlTemplate } from '@/frontend-pdf-templates/ledgerDistributerPdfHtmlTemplate'
import html2pdf from 'html2pdf.js'
import { formatTime } from '@/@core/utils/format'
import { imageConvertBase64 } from '@/utils/imageConvertBase64'

type Props = {
  open: boolean
  handleClose: () => void
  distributorId: string
}

const schema = yup.object().shape({
  fileType: yup.string().required('Please select pdf or csv.'),
  email: yup.string().email().matches(EMAIL_REGX, 'Invalid email address')
})

const DistributorLedgerDrawer = ({ open, handleClose, distributorId }: Props) => {
  //states

  const [isLoading, setIsLoading] = useState(false)

  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null })

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

  const onSubmit = async (data: DistributorLedger) => {
    const { email, fileType } = data

    if (distributorId && fileType && email && dateRange) {
      setIsLoading(true)

      if (fileType === 'pdf') {
        const res = await exportDistributorLedger({ distributorId, fileType, email, dateRange })
        const base64Logo = await imageConvertBase64(SheBeautyLogo)
        const htmlContent = ledgerDistributorPdfHtmlTemplate({
          distributor: res?.data?.distributor,
          mergedData: res?.data?.mergedData,
          startDate: res?.data?.startDate,
          endDate: res?.data?.endDate,
          base64Logo
        })

        const options = {
          filename: 'Invoice.pdf',
          image: { type: 'png', quality: 0.98 },
          html2canvas: { dpi: 192, letterRendering: true },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
        }

        const pdfBlob = await html2pdf().from(htmlContent).set(options).toPdf().outputPdf('blob')
        const formData = new FormData()
        formData.append('file', pdfBlob, 'ledger.pdf')
        formData.append('email', email || '')
        formData.append('fileType', fileType || '')
        formData.append('emailType', 'LEDGER')
        formData.append('startDate', formatTime(res?.data.startDate) || '')
        formData.append('endDate', formatTime(res?.data?.endDate) || '')

        try {
          const emailResponse = await sendLegderAndVendorReportPdfEmail(formData)
          setIsLoading(false)
          console.log(emailResponse, '<<< emailResponse')
          toast.success(emailResponse?.data?.message)
        } catch (emailError) {
          console.error('Error sending email:', emailError)
          toast.error('Failed to send the email. Please try again.')
        }
      } else if (fileType === 'csv') {
        try {
          // console.log('csv function call')
          const res = await exportDistributorLedger({ distributorId, fileType, email, dateRange })
          setIsLoading(false)
          toast.success(res?.message)
        } catch (error: any | string) {
          throw new Error(error)
        }

        // exportLedgerMutation.mutate({ distributorId, fileType, email, dateRange })
      }
    }
  }

  // Reset function
  const handleReset = () => {
    handleClose()
    reset()

    setIsLoading(false)
  }

  //export Ledger mutation
  const exportLedgerMutation = useMutation({
    mutationFn: AdminLedgerService.exportDistributorLedger,
    onSuccess: handleExportLedgerSuccess,
    onError: handleExportLedgerError
  })

  function handleExportLedgerSuccess(data: any) {
    if (data?.message) {
      handleReset()
      toast.success(data?.message || 'Ledger report created successfully')
    }
  }

  function handleExportLedgerError(error: any) {
    setIsLoading(false)

    if (error.response.data.error)
      toast.error(error.response.data.error || 'Oops! something went wrong.please try again later.')
  }

  // handle Date Picker
  const handleDateRange = (startDate: Date | null, endDate: Date | null) => {
    if (startDate && endDate) setDateRange({ startDate, endDate })
    else setDateRange({ startDate: null, endDate: null })
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
          <Typography variant='h5'>Export Distributor Ledger</Typography>
          <IconButton onClick={handleReset}>
            <i className='tabler-x text-textPrimary' />
          </IconButton>
        </div>
        <Divider />
        <div>
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6 p-6 '>
            <CustomDateRangePicker handleDateRange={handleDateRange} isColumnPicker isReset={open} />

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

export default DistributorLedgerDrawer
