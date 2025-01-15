'use client'

// ** React Imports
import { useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

import Image from 'next/image'

import Link from 'next/link'

import { Box, IconButton } from '@mui/material'

import { useMutation, useQuery } from '@tanstack/react-query'

import { toast } from 'react-toastify'

import Icon from '@core/components/icon'

import CustomTable from './CustomTable'

import { BILL_COLLAPSIBLE_HEAD_DATA, BILL_HEAD_DATA } from '@/table-head-data/data'

import { StyledTableCell } from './MuiTableCellStyle'

import BillCollapsibleTable from './BillCollapsibleTable'
import { AdminBillService } from '@/services'

import type { Bill } from '@/types/bill'
import TableRowLoader from './TableRowLoader'
import { useDebounce } from '@/@core/hooks/useDebounce'
import Spinner from './Spinner'
import ConfirmationDialog from '../confirmation-dialog'
import { ImageViewDialogBox } from '.'
import type { DateRange } from '@/types/date'
import { formatTime } from '@/@core/utils/format'

const BillTable = () => {
  // ** States
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [pageNo, setPageNo] = useState<number>(1)
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({})
  const [searchValue, setSearchValue] = useState<string>('')
  const [billData, setBillData] = useState<Bill>()
  const [billId, setBillId] = useState('')
  const [viewImage, setViewImage] = useState(false)
  const [isLoadingSpinner, setIsLoadingSpinner] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)

  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null })

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

  //use Query for bill data
  const { data, error, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['bills', pageNo, rowsPerPage, dateRange],
    queryFn: () => AdminBillService.getBills(pageNo, rowsPerPage, dateRange?.startDate, dateRange?.endDate)
  })

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

    !openRows[id] ? setBillId(id) : setBillId('')
  }

  //use Query for Bill searching
  const searchBill = useQuery({
    queryKey: ['billSearch', debounceSearch],
    queryFn: () => AdminBillService.searchBills(debounceSearch),
    enabled: Boolean(debounceSearch)
  })

  if (searchBill?.isError) toast.error(searchBill?.error.message || 'Oops! something went wrong')

  // function to delete Bill
  const handleOpenConfirmationBox = (_id?: string) => {
    setOpenConfirmDialog(true)
    setBillData({ _id })
  }

  const handleDelete = () => {
    if (billData?._id) {
      deleteBillMutation.mutate(billData?._id)
      setIsLoadingSpinner(true)
    }
  }

  //Delete Bill mutation
  const deleteBillMutation = useMutation({
    mutationFn: AdminBillService.deleteBill,
    onSuccess: handleDeleteBillSuccess,
    onError: handleDeleteBillError
  })

  function handleDeleteBillSuccess(data: any) {
    if (data?.message) {
      setIsLoadingSpinner(false)
      refetch()
      setBillData({})
      toast.success('It has been deleted successfully.')
      setOpenConfirmDialog(false)
    } else {
      setIsLoadingSpinner(false)
      refetch()
      setBillData({})
      setOpenConfirmDialog(false)
      toast.error('Oops! something went wrong.please try again')
    }
  }

  function handleDeleteBillError(error: any) {
    refetch()
    setBillData({})
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
    setBillData({
      bill_image: photo
    })
  }

  // handle Date Picker
  const handleDateRange = (startDate: Date | null, endDate: Date | null) => {
    if (startDate && endDate) setDateRange({ startDate, endDate })
    else setDateRange({ startDate: null, endDate: null })
  }

  return (
    <>
      <Spinner open={isLoadingSpinner} />

      <ConfirmationDialog
        open={openConfirmDialog}
        setOpen={setOpenConfirmDialog}
        type='delete-it'
        confrimation={handleDelete}
      />

      <ImageViewDialogBox
        openImageViewBox={viewImage}
        handleImageViewClose={handleImageViewDialogClose}
        src={billData?.bill_image}
      />

      <CustomTable
        tableTitle='Billings'
        head={BILL_HEAD_DATA}
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
        placeholder='Search Bill'
        buttonLabel='ADD BILL'
        onClick={() => router.push('/admin/billing/add')}
        isDateRangePicker
        handleDateRange={handleDateRange}
      >
        {isLoading ? (
          <TableRowLoader rowsNum={rowsPerPage} cellsNum={BILL_HEAD_DATA.length} />
        ) : (
          (searchBill?.data || data)?.bills?.map((row: Bill, index: number) => {
            const { name } = row.vendor!
            const _id = row._id!

            return (
              <BillCollapsibleTable
                key={index}
                head={BILL_COLLAPSIBLE_HEAD_DATA}
                open={openRows[_id] || false}
                billId={billId}
              >
                <StyledTableCell>
                  <IconButton aria-label='expand row' onClick={() => handleRowClick(_id)}>
                    <Icon icon={openRows[_id] ? 'tabler:chevron-up' : 'tabler:chevron-down'} />
                  </IconButton>
                </StyledTableCell>
                <StyledTableCell>
                  <Box display='flex' flexDirection='row' alignItems='center' gap={4}>
                    {row?.vendor?.photo ? (
                      <Image
                        src={row?.vendor?.photo}
                        alt={row?.vendor?.name || ''}
                        width={40}
                        height={40}
                        className='w-[40px] h-[40px] cursor-pointer'
                        unoptimized
                        onClick={() => handleImageViewDialogOpen(row?.vendor?.photo)}
                      />
                    ) : (
                      <Box sx={{ width: '40px', height: '40px', bgcolor: 'background.default' }} />
                    )}

                    {row?.vendor?.name}
                  </Box>
                </StyledTableCell>
                <StyledTableCell>
                  {row?.bill_image ? (
                    <Image
                      src={row?.bill_image}
                      alt={name || 'Bill screenshot'}
                      width={40}
                      height={40}
                      className='w-[40px] h-[40px] cursor-pointer'
                      unoptimized
                      onClick={() => handleImageViewDialogOpen(row?.bill_image)}
                    />
                  ) : (
                    <Image
                      src={require('/public/images/avatars/1.png')}
                      alt={'avatar'}
                      width={40}
                      height={40}
                      style={{ cursor: 'pointer' }}
                    />
                  )}
                </StyledTableCell>
                <StyledTableCell>{row?.total_items || 0}</StyledTableCell>
                <StyledTableCell>{row?.bill_amount || 0}</StyledTableCell>
                <StyledTableCell>{formatTime(row?.createdAt)}</StyledTableCell>

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
                  </Box>
                </StyledTableCell>
              </BillCollapsibleTable>
            )
          })
        )}
      </CustomTable>
    </>
  )
}

export default BillTable
