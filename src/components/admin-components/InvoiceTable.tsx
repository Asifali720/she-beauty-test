'use client'
import { useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

import Image from 'next/image'

import Link from 'next/link'

import { Box, IconButton } from '@mui/material'

import { useMutation, useQuery } from '@tanstack/react-query'

import { toast } from 'react-toastify'

import Icon from '@core/components/icon'

import { INVOICE_COLLAPSIBLE_HEAD_DATA, INVOICE_HEAD_DATA } from '@/table-head-data/data'

import { formatTime } from '@core/utils/format'

import CustomTable from './CustomTable'
import { StyledTableCell } from './MuiTableCellStyle'
import InvoiceCollapsibleTable from './InvoiceCollapsibleTable'
import type { Invoice } from '@/types/invoice'
import { AdminInvoiceService } from '@/services'

import { useDebounce } from '@/@core/hooks/useDebounce'
import Spinner from './Spinner'
import ConfirmationDialog from '../confirmation-dialog'
import TableRowLoader from './TableRowLoader'
import { ImageViewDialogBox } from '.'
import type { DateRange } from '@/types/date'
import InvoiceDrawer from './InvoiceDrawer'

const InvoiceTable = () => {
  // ** States
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [pageNo, setPageNo] = useState<number>(1)
  const [viewImage, setViewImage] = useState(false)
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({})
  const [searchValue, setSearchValue] = useState<string>('')
  const [invoiceData, setInvoiceData] = useState<Invoice>()
  const [invoiceId, setInvoiceId] = useState('')
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null })
  const [isLoadingSpinner, setIsLoadingSpinner] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [distributorInvoiceId, setDistributorInvoiceId] = useState<string>('')

  const router = useRouter()
  const debounceSearch = useDebounce(searchValue)

  //functions for pangination
  const handleChangePage = (newPage: number) => {
    setPageNo(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)

    setPageNo(1)
  }

  console.log('🚀 ~ AdminInvoiceService:', AdminInvoiceService)

  //use Query for invoice data
  const { data, error, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['invoices', pageNo, rowsPerPage, dateRange],
    queryFn: () => AdminInvoiceService.getInvoices(pageNo, rowsPerPage, dateRange?.startDate, dateRange?.endDate)
  })

  console.log('🚀 ~ InvoiceTable ~ data:', data)
  console.log('🚀 ~ InvoiceTable ~ invoiceData:', invoiceData)

  if (isError) toast.error(error.message || 'Oops! something went wrong')

  // Toggle state for clicked row
  const handleRowClick = (id: string) => {
    setOpenRows(prevOpenRows => {
      // Close all rows if a new row is clicked
      const newOpenRows = { ...prevOpenRows }

      Object.keys(newOpenRows).forEach(key => (newOpenRows[key] = false))
      newOpenRows[id] = !prevOpenRows[id] // Toggle clicked row

      return newOpenRows
    })

    !openRows[id] ? setInvoiceId(id) : setInvoiceId('')
  }

  //use Query for Invoice searching
  const searchInvoice = useQuery({
    queryKey: ['invoiceSearch', debounceSearch],
    queryFn: () => AdminInvoiceService.searchInvoices(debounceSearch),
    enabled: Boolean(debounceSearch)
  })

  if (searchInvoice?.isError) toast.error(searchInvoice?.error.message || 'Oops! something went wrong')

  // function to delete Invoice
  const handleOpenConfirmationBox = (_id?: string) => {
    setOpenConfirmDialog(true)
    setInvoiceData({ _id })
  }

  const handleDelete = () => {
    if (invoiceData?._id) {
      deleteInvoiceMutation.mutate(invoiceData?._id)
      setIsLoadingSpinner(true)
    }
  }

  //Delete Invoice mutation
  const deleteInvoiceMutation = useMutation({
    mutationFn: AdminInvoiceService.deleteInvoice,
    onSuccess: handleDeleteInvoiceSuccess,
    onError: handleDeleteInvoiceError
  })

  function handleDeleteInvoiceSuccess(data: any) {
    if (data?.message) {
      setIsLoadingSpinner(false)
      refetch()
      setInvoiceData({})
      toast.success('It has been deleted successfully.')
      setOpenConfirmDialog(false)
    } else {
      setIsLoadingSpinner(false)
      refetch()
      setInvoiceData({})
      setOpenConfirmDialog(false)
      toast.error('Oops! something went wrong.please try again')
    }
  }

  function handleDeleteInvoiceError(error: any) {
    refetch()
    setInvoiceData({})
    setIsLoadingSpinner(false)
    setOpenConfirmDialog(false)

    if (error.response.data.error)
      toast.error(error.response.data.error || 'Oops! something went wrong.please try again')
  }

  //Image view dialog box function
  const handleImageViewDialogClose = () => {
    setViewImage(false)
  }

  const handleImageViewDialogOpen = (photo: string) => {
    setViewImage(true)
    setInvoiceData({
      distributorPhoto: photo
    })
  }

  // handle Date Picker
  const handleDateRange = (startDate: Date | null, endDate: Date | null) => {
    if (startDate && endDate) setDateRange({ startDate, endDate })
    else setDateRange({ startDate: null, endDate: null })
  }

  const handleOpenDrawerAndSetInvoiceId = (id: string) => {
    setIsDrawerOpen(true)
    setDistributorInvoiceId(id)
  }

  return (
    <>
      <Spinner open={isLoadingSpinner} />

      <InvoiceDrawer open={isDrawerOpen} invoiceId={distributorInvoiceId} handleClose={() => setIsDrawerOpen(false)} />

      <ConfirmationDialog
        open={openConfirmDialog}
        setOpen={setOpenConfirmDialog}
        type='delete-it'
        confrimation={handleDelete}
      />

      <ImageViewDialogBox
        openImageViewBox={viewImage}
        handleImageViewClose={handleImageViewDialogClose}
        src={invoiceData?.distributorPhoto}
      />

      <CustomTable
        tableTitle='Invoices'
        head={INVOICE_HEAD_DATA}
        count={data?.totalRows}
        rowsPerPage={rowsPerPage}
        page={pageNo}
        handleChangePage={handleChangePage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
        isFetching={isFetching}
        value={searchValue}
        onChange={e => {
          setSearchValue(e.target.value)
        }}
        placeholder='Search Invoice'
        buttonLabel='ADD INVOICE'
        onClick={() => router.push('/admin/invoices/add')}
        isDateRangePicker
        handleDateRange={handleDateRange}
      >
        {isLoading ? (
          <TableRowLoader rowsNum={rowsPerPage} cellsNum={INVOICE_HEAD_DATA.length} />
        ) : (
          (searchInvoice?.data || data)?.invoices?.map((row: Invoice, index: number) => {
            console.log('🚀 ~ row:', row)
            const { name, photo } = row.distributor!
            const _id = row._id!

            return (
              <InvoiceCollapsibleTable
                key={index}
                head={INVOICE_COLLAPSIBLE_HEAD_DATA}
                open={openRows[_id] || false}
                invoiceId={invoiceId}
              >
                <StyledTableCell>
                  <IconButton aria-label='expand row' onClick={() => handleRowClick(_id)}>
                    <Icon icon={openRows[_id] ? 'tabler:chevron-up' : 'tabler:chevron-down'} />
                  </IconButton>
                </StyledTableCell>

                <StyledTableCell>{row?.invoice_number || 'N/A'}</StyledTableCell>

                <StyledTableCell>
                  <Box display='flex' flexDirection='row' alignItems='center' gap={4}>
                    {photo ? (
                      <Image
                        src={photo}
                        alt={name || ''}
                        width={40}
                        height={40}
                        className='w-[40px] h-[40px] cursor-pointer'
                        unoptimized
                        onClick={() => handleImageViewDialogOpen(photo)}
                      />
                    ) : (
                      <Box sx={{ width: '40px', height: '40px', bgcolor: 'background.default' }} />
                    )}

                    {name}
                  </Box>
                </StyledTableCell>

                <StyledTableCell>{row?.total_items || 0}</StyledTableCell>
                <StyledTableCell>{row?.invoice_amount || 0}</StyledTableCell>
                <StyledTableCell>{formatTime(row?.due_date) || 'N/A'}</StyledTableCell>
                <StyledTableCell>{formatTime(row?.createdAt) || 'N/A'}</StyledTableCell>
                <StyledTableCell>{formatTime(row?.updatedAt) || 'N/A'}</StyledTableCell>

                <StyledTableCell>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <IconButton LinkComponent={Link} href={`edit/${row?._id}`}>
                      <Icon icon='mdi:edit' />
                    </IconButton>
                    <IconButton onClick={() => handleOpenConfirmationBox(row?._id)}>
                      <Icon icon='mdi:trash' />
                    </IconButton>
                    <IconButton
                      style={{ rotate: '-45deg' }}
                      onClick={() => handleOpenDrawerAndSetInvoiceId(row?._id ? row?._id : '')}
                    >
                      <Icon icon='mdi:send' />
                    </IconButton>
                    <IconButton>
                      <Icon icon='mdi:download' />
                    </IconButton>
                  </Box>
                </StyledTableCell>
              </InvoiceCollapsibleTable>
            )
          })
        )}
      </CustomTable>
    </>
  )
}

export default InvoiceTable
