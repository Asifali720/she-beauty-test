'use client'

import { useState } from 'react'

import Image from 'next/image'

import { Box, IconButton } from '@mui/material'

import { useMutation, useQuery } from '@tanstack/react-query'

import { toast } from 'react-toastify'

import Icon from '@core/components/icon'

import { ADJUSTMENT_HEAD_DATA } from '@/table-head-data/data'

import CustomTable from './CustomTable'
import { StyledTableCell } from './MuiTableCellStyle'

import { StyledTableRow } from './MuiTableRowStyle'
import type { Adjustment } from '@/types/adjustment'
import { AdminAdjustmentService } from '@/services'

import { ImageViewDialogBox, AdjustmentDrawer, Spinner, TableRowLoader, ViewNoteDialogBox } from '.'
import ConfirmationDialog from '../confirmation-dialog'
import { useDebounce } from '@/@core/hooks/useDebounce'
import type { DateRange } from '@/types/date'
import { formatTime } from '@/@core/utils/format'

const AdjustmentTable = () => {
  // ** States
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [pageNo, setPageNo] = useState<number>(1)
  const [searchValue, setSearchValue] = useState<string>('')
  const [adjustmentPopUpOpen, setAdjustmentPopUpOpen] = useState(false)
  const [selectedPopUp, setSelectedPopUp] = useState('add')
  const [viewImage, setViewImage] = useState(false)
  const [adjustment, setAdjustment] = useState<Adjustment>()
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

  // function to open pop up for Adjustment
  const handleClose = () => {
    setAdjustmentPopUpOpen(false)
    setAdjustment({})
  }

  const handleOpenPopUp = (title: string, data?: Adjustment) => {
    setSelectedPopUp(title)
    setAdjustmentPopUpOpen(true)
    setAdjustment(data)
  }

  //use Query
  const { data, error, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['AdjustmentTable', pageNo, rowsPerPage, dateRange],
    queryFn: () => AdminAdjustmentService.getAdjustments(pageNo, rowsPerPage, dateRange?.startDate, dateRange?.endDate)
  })

  if (isError) toast.error(error.message || 'Oops! something went wrong')

  // function to delete Adjustment
  const handleOpenConfirmationBox = (_id?: string) => {
    setOpenConfirmDialog(true)
    setAdjustment({ _id })
  }

  const handleDelete = () => {
    if (adjustment?._id) {
      deleteAdjustmentMutation.mutate(adjustment?._id)
      setIsLoadingSpinner(true)
    }
  }

  //Delete adjustment mutation
  const deleteAdjustmentMutation = useMutation({
    mutationFn: AdminAdjustmentService.deleteAdjustment,
    onSuccess: handleDeleteAdjustmentSuccess,
    onError: handleDeleteAdjustmentError
  })

  function handleDeleteAdjustmentSuccess(data: any) {
    if (data?.data?.message) {
      setIsLoadingSpinner(false)
      refetch()
      setAdjustment({})
      toast.success('It has been deleted successfully.')
      setOpenConfirmDialog(false)
    }
  }

  function handleDeleteAdjustmentError(error: any) {
    refetch()
    setAdjustment({})
    setIsLoadingSpinner(false)
    setOpenConfirmDialog(false)

    if (error.response.data.error)
      toast.error(error.response.data.error || 'Oops! something went wrong.please try again')
  }

  //use Query for adjustment searching
  const searchAdjustment = useQuery({
    queryKey: ['adjustmentSearchTable', debounceSearch],
    queryFn: () => AdminAdjustmentService.searchAdjustment(debounceSearch),
    enabled: Boolean(debounceSearch)
  })

  if (searchAdjustment?.isError) toast.error(searchAdjustment?.error.message || 'Oops! something went wrong')

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
    setAdjustment({
      photo
    })
  }

  // View note dialog box function

  const handleOpenNoteDialogBox = (note?: string) => {
    setViewNote(true)
    setAdjustment({
      note
    })
  }

  const handleViewNoteDialogClose = () => {
    setViewNote(false)
  }

  return (
    <>
      <Spinner open={isLoadingSpinner} />

      <AdjustmentDrawer
        open={adjustmentPopUpOpen}
        handleClose={handleClose}
        selectedPopUp={selectedPopUp}
        refetch={refetch}
        adjustment={adjustment}
      />

      <ImageViewDialogBox
        openImageViewBox={viewImage}
        handleImageViewClose={handleImageViewDialogClose}
        src={adjustment?.photo}
      />

      <ViewNoteDialogBox open={viewNote} handleClose={handleViewNoteDialogClose} note={adjustment?.note} />

      <ConfirmationDialog
        open={openConfirmDialog}
        setOpen={setOpenConfirmDialog}
        type='delete-it'
        confrimation={handleDelete}
      />

      <CustomTable
        tableTitle='Adjustments'
        head={ADJUSTMENT_HEAD_DATA}
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
        placeholder='Search Adjustment'
        buttonLabel='ADD ADJUSTMENT'
        onClick={() => handleOpenPopUp('add')}
        isDateRangePicker
        handleDateRange={handleDateRange}
      >
        {isLoading ? (
          <TableRowLoader rowsNum={rowsPerPage} cellsNum={ADJUSTMENT_HEAD_DATA.length} />
        ) : (
          (searchAdjustment?.data || data)?.adjustments?.map((row: Adjustment, index: number) => {
            return (
              <StyledTableRow key={index}>
                <StyledTableCell>{row?.adjustment_number || 'N/A'}</StyledTableCell>

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

export default AdjustmentTable
