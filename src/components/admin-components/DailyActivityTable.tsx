'use client'

import { useState } from 'react'

import Image from 'next/image'

import { Box, IconButton } from '@mui/material'

import { useMutation, useQuery } from '@tanstack/react-query'

import { toast } from 'react-toastify'

import Icon from '@core/components/icon'

import { DAILY_ACTIVITY_HEAD_DATA } from '@/table-head-data/data'

import CustomTable from './CustomTable'
import { StyledTableCell } from './MuiTableCellStyle'

import { StyledTableRow } from './MuiTableRowStyle'
import type { DailyActivity } from '@/types/daily-activity'
import { AdminDailyActivityService } from '@/services'

import { DailyActivityDrawer, ImageViewDialogBox, Spinner, TableRowLoader } from '.'
import ConfirmationDialog from '../confirmation-dialog'
import { useDebounce } from '@/@core/hooks/useDebounce'
import type { DateRange } from '@/types/date'
import { formatTime } from '@/@core/utils/format'

const DailyActivityTable = () => {
  // ** States
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [pageNo, setPageNo] = useState<number>(1)
  const [searchValue, setSearchValue] = useState<string>('')
  const [dailyActivityPopUpOpen, setDailyActivityPopUpOpen] = useState(false)
  const [selectedPopUp, setSelectedPopUp] = useState('add')
  const [dailyActivity, setDailyActivity] = useState<DailyActivity>()
  const [isLoadingSpinner, setIsLoadingSpinner] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [viewImage, setViewImage] = useState(false)

  const debounceSearch = useDebounce(searchValue)
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null })

  //functions for pangination
  const handleChangePage = (newPage: number) => {
    setPageNo(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)

    setPageNo(1)
  }

  // function to open pop up for DailyActivity
  const handleClose = () => {
    setDailyActivityPopUpOpen(false)
    setDailyActivity({})
  }

  const handleOpenPopUp = (title: string, data?: DailyActivity) => {
    setSelectedPopUp(title)

    setDailyActivity(data)

    if (title === 'add') setDailyActivityPopUpOpen(true)
    else {
      setIsLoadingSpinner(true)
      setTimeout(() => {
        if (data) {
          setDailyActivityPopUpOpen(true)
          setIsLoadingSpinner(false)
        }
      }, 500)
    }
  }

  //use Query
  const { data, error, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['DailyActivity', pageNo, rowsPerPage, dateRange],
    queryFn: () =>
      AdminDailyActivityService.getDailyActivities(pageNo, rowsPerPage, dateRange?.startDate, dateRange?.endDate)
  })

  if (isError) toast.error(error.message || 'Oops! something went wrong')

  // function to delete DailyActivity
  const handleOpenConfirmationBox = (_id?: string) => {
    setOpenConfirmDialog(true)
    setDailyActivity({ _id })
  }

  const handleDelete = () => {
    if (dailyActivity?._id) {
      deleteDailyActivityMutation.mutate(dailyActivity?._id)
      setIsLoadingSpinner(true)
    }
  }

  //Delete Daily Activity mutation
  const deleteDailyActivityMutation = useMutation({
    mutationFn: AdminDailyActivityService.deleteActivity,
    onSuccess: handleDeleteDailyActivitySuccess,
    onError: handleDeleteDailyActivityError
  })

  function handleDeleteDailyActivitySuccess(data: any) {
    if (data?.data?.message) {
      setIsLoadingSpinner(false)
      refetch()
      setDailyActivity({})
      toast.success('It has been deleted successfully.')
      setOpenConfirmDialog(false)
    }
  }

  function handleDeleteDailyActivityError(error: any) {
    refetch()
    setDailyActivity({})
    setIsLoadingSpinner(false)
    setOpenConfirmDialog(false)

    if (error.response.data.error)
      toast.error(error.response.data.error || 'Oops! something went wrong.please try again')
  }

  //use Query for dialy activity searching
  const searchDialyActivities = useQuery({
    queryKey: ['dialyActivitySearchTable', debounceSearch],
    queryFn: () => AdminDailyActivityService.searchDialyActivity(debounceSearch),
    enabled: Boolean(debounceSearch)
  })

  if (searchDialyActivities?.isError) toast.error(searchDialyActivities?.error.message || 'Oops! something went wrong')

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
    setDailyActivity({
      photo
    })
  }

  return (
    <>
      <Spinner open={isLoadingSpinner} />

      <ImageViewDialogBox
        openImageViewBox={viewImage}
        handleImageViewClose={handleImageViewDialogClose}
        src={dailyActivity?.photo}
      />

      <DailyActivityDrawer
        open={dailyActivityPopUpOpen}
        handleClose={handleClose}
        selectedPopUp={selectedPopUp}
        refetch={refetch}
        dailyActivity={dailyActivity}
      />

      <ConfirmationDialog
        open={openConfirmDialog}
        setOpen={setOpenConfirmDialog}
        type='delete-it'
        confrimation={handleDelete}
      />

      <CustomTable
        tableTitle='Daily Activities'
        head={DAILY_ACTIVITY_HEAD_DATA}
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
        placeholder='Search Daily Activities'
        buttonLabel='ADD DAILY ACTIVITY'
        onClick={() => handleOpenPopUp('add')}
        isDateRangePicker
        handleDateRange={handleDateRange}
      >
        {isLoading ? (
          <TableRowLoader rowsNum={rowsPerPage} cellsNum={DAILY_ACTIVITY_HEAD_DATA.length} />
        ) : (
          (searchDialyActivities?.data || data)?.srDailyActivitities?.map((row: DailyActivity, index: number) => {
            return (
              <StyledTableRow key={index}>
                <StyledTableCell>
                  <Box display='flex' flexDirection='row' alignItems='center' gap={4}>
                    {row?.sales_representative?.photo ? (
                      <Image
                        src={row?.sales_representative?.photo}
                        alt={row?.sales_representative?.name || ''}
                        width={40}
                        height={40}
                        className='w-[40px] h-[40px] cursor-pointer'
                        unoptimized
                        onClick={() => handleImageViewDialogOpen(row?.sales_representative?.photo)}
                      />
                    ) : (
                      <Box sx={{ width: '40px', height: '40px', bgcolor: 'background.default' }} />
                    )}

                    {row?.sales_representative?.name}
                  </Box>
                </StyledTableCell>

                <StyledTableCell>{row?.no_of_shops || 0}</StyledTableCell>
                <StyledTableCell>{row?.no_of_orders || 0}</StyledTableCell>

                <StyledTableCell>{row?.amount_of_orders || 0}</StyledTableCell>
                <StyledTableCell>{row?.recovery_amount || 0}</StyledTableCell>
                <StyledTableCell>{formatTime(row?.visit_date) || 'N/A'}</StyledTableCell>
                <StyledTableCell>{formatTime(row?.createdAt) || 'N/A'}</StyledTableCell>
                <StyledTableCell>{formatTime(row?.updatedAt) || 'N/A'}</StyledTableCell>

                <StyledTableCell>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
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

export default DailyActivityTable
