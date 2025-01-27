'use client'
import { useState } from 'react'

import Image from 'next/image'

import { Box } from '@mui/material'

import { toast } from 'react-toastify'

import { useQuery } from '@tanstack/react-query'

import { SINGLE_DISTRIBUTOR_HEAD_DATA, DISTRIBUTOR_LEGDER_HEAD_DATA } from '@/table-head-data/data'

import CustomTable from './CustomTable'
import { StyledTableCell } from './MuiTableCellStyle'
import { StyledTableRow } from './MuiTableRowStyle'
import { ImageViewDialogBox, DistributorLedgerDrawer, LegderTable, Spinner, TableRowLoader } from '.'

import type { Distributor } from '@/types/distributor'

import { AdminDistributorService } from '@/services'

import { formatTime } from '@/@core/utils/format'
import type { DateRange } from '@/types/date'

const DistributorLedger = ({ params }: { params: { distributorId: string } }) => {
  // ** States
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [pageNo, setPageNo] = useState<number>(1)
  const [viewImage, setViewImage] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null })
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const [distributor, setDistributor] = useState<Distributor>()

  const { distributorId } = params

  //functions for pangination
  const handleChangePage = (newPage: number) => {
    setPageNo(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)

    setPageNo(1)
  }

  // use Query for getting Distributor data by id
  const getDistributorbyId = useQuery({
    queryKey: [`distributors/legder/${distributorId}`, distributorId],
    queryFn: () => AdminDistributorService.getDistributorById(distributorId),
    enabled: Boolean(distributorId)
  })

  const distributorData: Distributor = getDistributorbyId?.data?.data?.distributor || {}

  //use Query for legder
  const { data, error, isLoading, isError, isFetching } = useQuery({
    queryKey: ['distributorsLegder', pageNo, rowsPerPage, dateRange],
    queryFn: () =>
      AdminDistributorService.getDistributorsLegder(
        distributorId,
        pageNo,
        rowsPerPage,
        dateRange?.startDate,
        dateRange?.endDate
      )
  })

  if (isError) toast.error(error.message || 'Oops! something went wrong')

  //Image view dialog box function
  const handleImageViewDialogClose = () => {
    setViewImage(false)
  }

  const handleImageViewDialogOpen = (photo: string) => {
    setViewImage(true)
    setDistributor({
      photo
    })
  }

  // handle Date Picker
  const handleDateRange = (startDate: Date | null, endDate: Date | null) => {
    if (startDate && endDate) setDateRange({ startDate, endDate })
    else setDateRange({ startDate: null, endDate: null })
  }

  // function to open pop up for distributor
  const handleClose = () => {
    setIsDrawerOpen(false)
  }

  const handleOpen = () => {
    setIsDrawerOpen(true)
  }

  return (
    <>
      <Spinner open={getDistributorbyId?.isFetching || isLoading} />

      <DistributorLedgerDrawer distributorId={distributorId} open={isDrawerOpen} handleClose={handleClose} />

      <ImageViewDialogBox
        openImageViewBox={viewImage}
        handleImageViewClose={handleImageViewDialogClose}
        src={distributor?.photo}
      />

      <LegderTable head={SINGLE_DISTRIBUTOR_HEAD_DATA} sx={{ mb: '25px' }}>
        {getDistributorbyId?.isLoading ? (
          <TableRowLoader rowsNum={1} cellsNum={SINGLE_DISTRIBUTOR_HEAD_DATA.length} />
        ) : (
          <StyledTableRow>
            <StyledTableCell>
              <Box display='flex' flexDirection='row' alignItems='center' gap={4}>
                {distributorData?.photo ? (
                  <Image
                    src={distributorData?.photo}
                    alt={distributorData?.name || ''}
                    width={40}
                    height={40}
                    className='w-[40px] h-[40px] cursor-pointer'
                    unoptimized
                    onClick={() => handleImageViewDialogOpen(distributorData?.photo)}
                  />
                ) : (
                  <Box sx={{ width: '40px', height: '40px', bgcolor: 'background.default' }} />
                )}

                {distributorData?.name}
              </Box>
            </StyledTableCell>
            <StyledTableCell>{distributorData?.phone_no || 'N/A'}</StyledTableCell>
            <StyledTableCell>{distributorData?.email || 'N/A'}</StyledTableCell>
            <StyledTableCell>{distributorData?.address || 'N/A'}</StyledTableCell>
            <StyledTableCell>{distributorData?.to_received || 0}</StyledTableCell>
            <StyledTableCell>{distributorData?.last_received_amount || 0}</StyledTableCell>
            <StyledTableCell>{formatTime(distributorData?.last_received) || 0}</StyledTableCell>

            <StyledTableCell>{distributorData?.claimed_amount || 0}</StyledTableCell>
            <StyledTableCell>{formatTime(distributorData?.createdAt) || 'N/A'}</StyledTableCell>

            <StyledTableCell>{formatTime(distributorData?.updatedAt) || 'N/A'}</StyledTableCell>
          </StyledTableRow>
        )}
      </LegderTable>

      <CustomTable
        tableTitle='Distributor Legder'
        head={DISTRIBUTOR_LEGDER_HEAD_DATA}
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
          <TableRowLoader rowsNum={rowsPerPage} cellsNum={DISTRIBUTOR_LEGDER_HEAD_DATA.length} />
        ) : (
          data?.distributorLegder?.map((row: any, index: number) => {
            const photo = row?.screenshot
            const amount = row?.invoice_amount || row?.amount || row?.total_cost

            return (
              <StyledTableRow key={index}>
                <StyledTableCell>{row?.type}</StyledTableCell>

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

export default DistributorLedger
