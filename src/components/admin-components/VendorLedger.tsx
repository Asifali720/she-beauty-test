'use client'
import { useState } from 'react'

import Image from 'next/image'

import { Box } from '@mui/material'

import { toast } from 'react-toastify'

import { useQuery } from '@tanstack/react-query'

import { SINGLE_VENDOR_HEAD_DATA, VENDOR_LEGDER_HEAD_DATA } from '@/table-head-data/data'

import CustomTable from './CustomTable'
import { StyledTableCell } from './MuiTableCellStyle'
import { StyledTableRow } from './MuiTableRowStyle'
import { ImageViewDialogBox, VendorLedgerDrawer, LegderTable, Spinner, TableRowLoader } from '.'

import type { Vendor } from '@/types/vendor'

import { AdminVendorService } from '@/services'

import { formatTime } from '@/@core/utils/format'
import type { DateRange } from '@/types/date'

const VendorLedger = ({ params }: { params: { vendorId: string } }) => {
  // ** States
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [pageNo, setPageNo] = useState<number>(1)
  const [viewImage, setViewImage] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null })
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const [vendor, setVendor] = useState<Vendor>()

  const { vendorId } = params

  //functions for pangination
  const handleChangePage = (newPage: number) => {
    setPageNo(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)

    setPageNo(1)
  }

  // use Query for getting Vendor data by id
  const getVendorbyId = useQuery({
    queryKey: [`vendors/legder/${vendorId}`, vendorId],
    queryFn: () => AdminVendorService.getVendorById(vendorId),
    enabled: Boolean(vendorId)
  })

  const vendorData: Vendor = getVendorbyId?.data?.data?.vendor || {}

  //use Query for legder
  const { data, error, isLoading, isError, isFetching } = useQuery({
    queryKey: ['vendorsLegder', pageNo, rowsPerPage, dateRange],
    queryFn: () =>
      AdminVendorService.getVendorsLegder(vendorId, pageNo, rowsPerPage, dateRange?.startDate, dateRange?.endDate)
  })

  if (isError) toast.error(error.message || 'Oops! something went wrong')

  //Image view dialog box function
  const handleImageViewDialogClose = () => {
    setViewImage(false)
  }

  const handleImageViewDialogOpen = (photo: string) => {
    setViewImage(true)
    setVendor({
      photo
    })
  }

  // handle Date Picker
  const handleDateRange = (startDate: Date | null, endDate: Date | null) => {
    if (startDate && endDate) setDateRange({ startDate, endDate })
    else setDateRange({ startDate: null, endDate: null })
  }

  // function to open pop up for vendor
  const handleClose = () => {
    setIsDrawerOpen(false)
  }

  const handleOpen = () => {
    setIsDrawerOpen(true)
  }

  return (
    <>
      <Spinner open={getVendorbyId?.isFetching || isLoading} />

      <VendorLedgerDrawer vendorId={vendorId} open={isDrawerOpen} handleClose={handleClose} />

      <ImageViewDialogBox
        openImageViewBox={viewImage}
        handleImageViewClose={handleImageViewDialogClose}
        src={vendor?.photo}
      />

      <LegderTable head={SINGLE_VENDOR_HEAD_DATA} sx={{ mb: '25px' }}>
        {getVendorbyId?.isLoading ? (
          <TableRowLoader rowsNum={1} cellsNum={SINGLE_VENDOR_HEAD_DATA.length} />
        ) : (
          <StyledTableRow>
            <StyledTableCell>
              <Box display='flex' flexDirection='row' alignItems='center' gap={4}>
                {vendorData?.photo ? (
                  <Image
                    src={vendorData?.photo}
                    alt={vendorData?.name || ''}
                    width={40}
                    height={40}
                    className='w-[40px] h-[40px] cursor-pointer'
                    unoptimized
                    onClick={() => handleImageViewDialogOpen(vendorData?.photo)}
                  />
                ) : (
                  <Box sx={{ width: '40px', height: '40px', bgcolor: 'background.default' }} />
                )}

                {vendorData?.name}
              </Box>
            </StyledTableCell>
            <StyledTableCell>{vendorData?.phone_no || 'N/A'}</StyledTableCell>
            <StyledTableCell>{vendorData?.email || 'N/A'}</StyledTableCell>
            <StyledTableCell>{vendorData?.address || 'N/A'}</StyledTableCell>
            <StyledTableCell>{vendorData?.balance_amount || 0}</StyledTableCell>
            <StyledTableCell>{vendorData?.last_paid_amount || 0}</StyledTableCell>
            <StyledTableCell>{formatTime(vendorData?.last_paid) || 'N/A'}</StyledTableCell>
            <StyledTableCell>{formatTime(vendorData?.createdAt) || 'N/A'}</StyledTableCell>
            <StyledTableCell>{formatTime(vendorData?.updatedAt) || 'N/A'}</StyledTableCell>
          </StyledTableRow>
        )}
      </LegderTable>

      <CustomTable
        tableTitle='Vendor Legder'
        head={VENDOR_LEGDER_HEAD_DATA}
        count={data?.totalRows}
        rowsPerPage={rowsPerPage}
        page={pageNo}
        handleChangePage={handleChangePage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
        isFetching={isFetching}
        isDateRangePicker
        handleDateRange={handleDateRange}
        isButton={true}
        isSearchField={false}
        buttonLabel='EXPORT LEDGER'
        onClick={handleOpen}
      >
        {isLoading ? (
          <TableRowLoader rowsNum={rowsPerPage} cellsNum={VENDOR_LEGDER_HEAD_DATA.length} />
        ) : (
          data?.vendorLegder?.map((row: any, index: number) => {
            const photo = row?.bill_image || row?.screenshot
            const amount = row?.bill_amount || row?.amount

            return (
              <StyledTableRow key={index}>
                <StyledTableCell>{row?.bill_amount ? 'Bill' : 'Paid Payment'}</StyledTableCell>

                <StyledTableCell>{amount || 'N/A'}</StyledTableCell>
                <StyledTableCell>{row?.total_items || 0}</StyledTableCell>
                <StyledTableCell>
                  {photo ? (
                    <Image
                      src={photo}
                      alt={'screenshot'}
                      width={40}
                      height={40}
                      className='w-[40px] h-[40px] cursor-pointer'
                      unoptimized
                      onClick={() => handleImageViewDialogOpen(photo)}
                    />
                  ) : (
                    <Box sx={{ width: '40px', height: '40px', bgcolor: 'background.default' }} />
                  )}
                </StyledTableCell>
                <StyledTableCell>{row?.note || 'N/A'}</StyledTableCell>
                <StyledTableCell>{formatTime(row?.createdAt) || 'N/A'}</StyledTableCell>
              </StyledTableRow>
            )
          })
        )}
      </CustomTable>
    </>
  )
}

export default VendorLedger
