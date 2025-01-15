'use client'

// ** React Imports
import { useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

import { Box, IconButton } from '@mui/material'

import { useMutation, useQuery } from '@tanstack/react-query'

import { toast } from 'react-toastify'

import Icon from '@core/components/icon'

import CustomTable from './CustomTable'

import { ORDER_COLLAPSIBLE_HEAD_DATA, ORDER_HEAD_DATA } from '@/table-head-data/data'

import { StyledTableCell } from './MuiTableCellStyle'

import OrderCollapsibleTable from './OrderCollapsibleTable'
import { AdminOrderService } from '@/services'

import type { Order } from '@/types/order'
import TableRowLoader from './TableRowLoader'
import { useDebounce } from '@/@core/hooks/useDebounce'
import Spinner from './Spinner'
import ConfirmationDialog from '../confirmation-dialog'
import type { DateRange } from '@/types/date'
import Chip from '@/@core/components/mui/Chip'

const OrderDispatchTable = () => {
  // ** States
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [pageNo, setPageNo] = useState<number>(1)
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({})
  const [searchValue, setSearchValue] = useState<string>('')
  const [orderData, setOrderData] = useState<Order>()
  const [orderId, setOrderId] = useState('')
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null })
  const [isLoadingSpinner, setIsLoadingSpinner] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)

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

  //use Query for getting all orders
  const { data, error, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['dispatchOrders', pageNo, rowsPerPage, dateRange],
    queryFn: () => AdminOrderService.getOrders(pageNo, rowsPerPage, dateRange?.startDate, dateRange?.endDate)
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

    !openRows[id] ? setOrderId(id) : setOrderId('')
  }

  //use Query for Order searching
  const searchOrder = useQuery({
    queryKey: ['orderSearch', debounceSearch],
    queryFn: () => AdminOrderService.searchOrders(debounceSearch),
    enabled: Boolean(debounceSearch)
  })

  if (searchOrder?.isError) toast.error(searchOrder?.error.message || 'Oops! something went wrong')

  // function to return Order
  const handleOpenConfirmationBox = (_id?: string) => {
    setOpenConfirmDialog(true)
    setOrderData({ _id })
  }

  const handleReturn = () => {
    if (orderData?._id) {
      returnOrderMutation.mutate(orderData?._id)
      setIsLoadingSpinner(true)
    }
  }

  //Return Order mutation
  const returnOrderMutation = useMutation({
    mutationFn: AdminOrderService.returnOrder,
    onSuccess: handleReturnOrderSuccess,
    onError: handleReturnOrderError
  })

  function handleReturnOrderSuccess(data: any) {
    if (data?.order) {
      setIsLoadingSpinner(false)
      refetch()
      setOrderData({})
      toast.success('It has been returned successfully.')
      setOpenConfirmDialog(false)
    } else {
      setIsLoadingSpinner(false)
      refetch()
      setOrderData({})
      setOpenConfirmDialog(false)
      toast.error('Oops! something went wrong.please try again')
    }
  }

  function handleReturnOrderError(error: any) {
    refetch()
    setOrderData({})
    setIsLoadingSpinner(false)
    setOpenConfirmDialog(false)

    if (error.response.data.error)
      toast.error(error.response.data.error || 'Oops! something went wrong.please try again')
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
        type='return-it'
        confrimation={handleReturn}
      />

      <CustomTable
        tableTitle='Orders'
        head={ORDER_HEAD_DATA}
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
        placeholder='Search Order'
        buttonLabel='DISPATCH'
        onClick={() => router.push('/admin/orders/dispatch-order')}
        isDateRangePicker
        handleDateRange={handleDateRange}
      >
        {isLoading ? (
          <TableRowLoader rowsNum={rowsPerPage} cellsNum={ORDER_HEAD_DATA.length} />
        ) : (
          (searchOrder?.data || data)?.orders?.map((row: Order, index: number) => {
            return (
              <OrderCollapsibleTable
                key={index}
                head={ORDER_COLLAPSIBLE_HEAD_DATA}
                open={openRows[row._id!] || false}
                orderId={orderId}
              >
                <StyledTableCell>
                  <IconButton aria-label='expand row' onClick={() => handleRowClick(row._id!)}>
                    <Icon icon={openRows[row._id!] ? 'tabler:chevron-up' : 'tabler:chevron-down'} />
                  </IconButton>
                </StyledTableCell>
                <StyledTableCell component='th' scope='row'>
                  {row?.customer_name}
                </StyledTableCell>

                <StyledTableCell>{row?.phone_no || 'N/A'}</StyledTableCell>
                <StyledTableCell>{row?.email || 'N/A'}</StyledTableCell>
                <StyledTableCell>{row?.address || 'N/A'}</StyledTableCell>
                <StyledTableCell>
                  <Chip
                    label={row?.status}
                    color={row?.status === 'dispatched' ? 'success' : 'error'}
                    variant='outlined'
                    sx={{ textTransform: 'capitalize' }}
                  />
                </StyledTableCell>
                <StyledTableCell>{row?.total_items || 0}</StyledTableCell>
                <StyledTableCell>{row?.total_price || 0}</StyledTableCell>

                <StyledTableCell>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <IconButton
                      onClick={() => handleOpenConfirmationBox(row?._id)}
                      disabled={row?.status !== 'dispatched'}
                    >
                      <Icon icon='material-symbols-light:assignment-return-outline' />
                    </IconButton>
                  </Box>
                </StyledTableCell>
              </OrderCollapsibleTable>
            )
          })
        )}
      </CustomTable>
    </>
  )
}

export default OrderDispatchTable
