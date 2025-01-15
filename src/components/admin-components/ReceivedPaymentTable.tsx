'use client'

import { useState } from 'react'

import Image from 'next/image'

import { Box, IconButton } from '@mui/material'

import { useMutation, useQuery } from '@tanstack/react-query'

import { toast } from 'react-toastify'

import Icon from '@core/components/icon'

import { RECEIVED_PAYMENT_HEAD_DATA } from '@/table-head-data/data'

import CustomTable from './CustomTable'
import { StyledTableCell } from './MuiTableCellStyle'

import { StyledTableRow } from './MuiTableRowStyle'
import type { ReceivedPayment } from '@/types/received-payment'
import { AdminReceivedPaymentService } from '@/services'

import { ImageViewDialogBox, ReceivedPaymentDrawer, Spinner, TableRowLoader, ViewNoteDialogBox } from '.'
import ConfirmationDialog from '../confirmation-dialog'
import { useDebounce } from '@/@core/hooks/useDebounce'
import type { DateRange } from '@/types/date'
import { formatTime } from '@/@core/utils/format'

const ReceivedPaymentTable = () => {
  // ** States
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [pageNo, setPageNo] = useState<number>(1)
  const [searchValue, setSearchValue] = useState<string>('')
  const [paymentPopUpOpen, setPaymentPopUpOpen] = useState(false)
  const [selectedPopUp, setSelectedPopUp] = useState('add')
  const [viewImage, setViewImage] = useState(false)
  const [receivedPayment, setReceivedPayment] = useState<ReceivedPayment>()
  const [isLoadingSpinner, setIsLoadingSpinner] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const debounceSearch = useDebounce(searchValue)
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null })
  const [viewNote, setViewNote] = useState(false)

  //functions for pangination
  const handleChangePage = (newPage: number) => {
    setPageNo(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)

    setPageNo(1)
  }

  // function to open pop up for Received Payment
  const handleClose = () => {
    setPaymentPopUpOpen(false)
    setReceivedPayment({})
  }

  const handleOpenPopUp = (title: string, data?: ReceivedPayment) => {
    setSelectedPopUp(title)
    setPaymentPopUpOpen(true)
    setReceivedPayment(data)
  }

  //use Query
  const { data, error, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['ReceivedPayment', pageNo, rowsPerPage, dateRange],
    queryFn: () =>
      AdminReceivedPaymentService.getReceivedPayments(pageNo, rowsPerPage, dateRange?.startDate, dateRange?.endDate)
  })

  if (isError) toast.error(error.message || 'Oops! something went wrong')

  // function to delete Received Payment
  const handleOpenConfirmationBox = (_id?: string) => {
    setOpenConfirmDialog(true)
    setReceivedPayment({ _id })
  }

  const handleDelete = () => {
    if (receivedPayment?._id) {
      deletePaymentMutation.mutate(receivedPayment?._id)
      setIsLoadingSpinner(true)
    }
  }

  //Delete receivedPayment mutation
  const deletePaymentMutation = useMutation({
    mutationFn: AdminReceivedPaymentService.deleteReceivedPayment,
    onSuccess: handleDeletePaymentSuccess,
    onError: handleDeletePaymentError
  })

  function handleDeletePaymentSuccess(data: any) {
    if (data?.data?.message) {
      setIsLoadingSpinner(false)
      refetch()
      setReceivedPayment({})
      toast.success('It has been deleted successfully.')
      setOpenConfirmDialog(false)
    }
  }

  function handleDeletePaymentError(error: any) {
    refetch()
    setReceivedPayment({})
    setIsLoadingSpinner(false)
    setOpenConfirmDialog(false)

    if (error.response.data.error)
      toast.error(error.response.data.error || 'Oops! something went wrong.please try again')
  }

  //use Query for receivedPayment searching
  const searchPayment = useQuery({
    queryKey: ['paymentSearchTable', debounceSearch],
    queryFn: () => AdminReceivedPaymentService.searchReceivedPayment(debounceSearch),
    enabled: Boolean(debounceSearch)
  })

  if (searchPayment?.isError) toast.error(searchPayment?.error.message || 'Oops! something went wrong')

  // handle Date Picker
  const handleDateRange = (startDate: Date | null, endDate: Date | null) => {
    if (startDate && endDate) setDateRange({ startDate, endDate })
    else setDateRange({ startDate: null, endDate: null })
  }

  //Image view dialog box function
  const handleImageViewDialogClose = () => {
    setViewImage(false)
  }

  const handleImageViewDialogOpen = (photo: string) => {
    setViewImage(true)
    setReceivedPayment({
      screenshot: photo
    })
  }

  // View note dialog box function

  const handleOpenNoteDialogBox = (note?: string) => {
    setViewNote(true)
    setReceivedPayment({
      note
    })
  }

  const handleViewNoteDialogClose = () => {
    setViewNote(false)
  }

  return (
    <>
      <Spinner open={isLoadingSpinner} />

      <ReceivedPaymentDrawer
        open={paymentPopUpOpen}
        handleClose={handleClose}
        selectedPopUp={selectedPopUp}
        refetch={refetch}
        receivedPayment={receivedPayment}
      />

      <ImageViewDialogBox
        openImageViewBox={viewImage}
        handleImageViewClose={handleImageViewDialogClose}
        src={receivedPayment?.screenshot}
      />

      <ViewNoteDialogBox open={viewNote} handleClose={handleViewNoteDialogClose} note={receivedPayment?.note} />

      <ConfirmationDialog
        open={openConfirmDialog}
        setOpen={setOpenConfirmDialog}
        type='delete-it'
        confrimation={handleDelete}
      />

      <CustomTable
        tableTitle='Received Payments'
        head={RECEIVED_PAYMENT_HEAD_DATA}
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
        placeholder='Search Received Payment'
        buttonLabel='ADD RECEIVED PAYMENT'
        onClick={() => handleOpenPopUp('add')}
        isDateRangePicker
        handleDateRange={handleDateRange}
      >
        {isLoading ? (
          <TableRowLoader rowsNum={rowsPerPage} cellsNum={RECEIVED_PAYMENT_HEAD_DATA.length} />
        ) : (
          (searchPayment?.data || data)?.receivedPayments?.map((row: ReceivedPayment, index: number) => {
            return (
              <StyledTableRow key={index}>
                <StyledTableCell>{row?.received_payment_number || 'N/A'}</StyledTableCell>

                <StyledTableCell>
                  <Box display='flex' flexDirection='row' alignItems='center' gap={4}>
                    {row?.distributor?.photo ? (
                      <Image
                        src={row?.distributor?.photo}
                        alt={row?.distributor?.name || ''}
                        width={40}
                        height={40}
                        className='w-[40px] h-[40px] cursor-pointer'
                        unoptimized
                        onClick={() => handleImageViewDialogOpen(row?.distributor?.photo)}
                      />
                    ) : (
                      <Box sx={{ width: '40px', height: '40px', bgcolor: 'background.default' }} />
                    )}

                    {row?.distributor?.name}
                  </Box>
                </StyledTableCell>

                <StyledTableCell>{row?.amount || 0}</StyledTableCell>
                <StyledTableCell>
                  {' '}
                  {row?.screenshot ? (
                    <Image
                      src={row?.screenshot}
                      alt={'screenshot'}
                      width={40}
                      height={40}
                      className='w-[40px] h-[40px] cursor-pointer'
                      unoptimized
                      onClick={() => handleImageViewDialogOpen(row?.screenshot)}
                    />
                  ) : (
                    <Box sx={{ width: '40px', height: '40px', bgcolor: 'background.default' }} />
                  )}
                </StyledTableCell>
                <StyledTableCell> {formatTime(row?.payment_date)}</StyledTableCell>
                <StyledTableCell> {formatTime(row?.createdAt)}</StyledTableCell>
                <StyledTableCell>{formatTime(row?.updatedAt)}</StyledTableCell>

                <StyledTableCell>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <IconButton onClick={() => handleOpenNoteDialogBox(row?.note)} disabled={Boolean(!row?.note)}>
                      <Icon icon='fluent:comment-note-24-filled' />
                    </IconButton>

                    <IconButton onClick={() => handleOpenPopUp('edit', row)}>
                      <Icon icon='mdi:edit' />
                    </IconButton>
                    <IconButton onClick={() => handleOpenConfirmationBox(row?._id)}>
                      <Icon icon='mdi:trash' />
                    </IconButton>
                  </Box>
                </StyledTableCell>
              </StyledTableRow>
            )
          })
        )}
      </CustomTable>
    </>
  )
}

export default ReceivedPaymentTable
