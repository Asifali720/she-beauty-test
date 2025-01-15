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

import { CLAIM_COLLAPSIBLE_HEAD_DATA, CLAIM_HEAD_DATA } from '@/table-head-data/data'

import { formatTime } from '@core/utils/format'

import CustomTable from './CustomTable'
import { StyledTableCell } from './MuiTableCellStyle'
import ClaimCollapsibleTable from './ClaimCollapsibleTable'
import type { Claim } from '@/types/claim'
import { AdminClaimService } from '@/services'

import { useDebounce } from '@/@core/hooks/useDebounce'
import Spinner from './Spinner'
import ConfirmationDialog from '../confirmation-dialog'
import TableRowLoader from './TableRowLoader'
import { ImageViewDialogBox, ViewNoteDialogBox } from '.'
import type { DateRange } from '@/types/date'

const ClaimTable = () => {
  // ** States
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [pageNo, setPageNo] = useState<number>(1)
  const [viewImage, setViewImage] = useState(false)
  const [viewNote, setViewNote] = useState(false)
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({})
  const [searchValue, setSearchValue] = useState<string>('')
  const [claimData, setClaimData] = useState<Claim>()
  const [claimId, setClaimId] = useState('')
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

  //use Query for claim data
  const { data, error, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['admin/claims/list', pageNo, rowsPerPage, dateRange],
    queryFn: () => AdminClaimService.getClaims(pageNo, rowsPerPage, dateRange?.startDate, dateRange?.endDate)
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

    !openRows[id] ? setClaimId(id) : setClaimId('')
  }

  //use Query for Claim searching
  const searchClaim = useQuery({
    queryKey: [`claimSearch/${debounceSearch}`, debounceSearch],
    queryFn: () => AdminClaimService.searchClaims(debounceSearch),
    enabled: Boolean(debounceSearch)
  })

  if (searchClaim?.isError) toast.error(searchClaim?.error.message || 'Oops! something went wrong')

  // function to delete Claim
  const handleOpenConfirmationBox = (_id?: string) => {
    setOpenConfirmDialog(true)
    setClaimData({ _id })
  }

  const handleDelete = () => {
    if (claimData?._id) {
      deleteClaimMutation.mutate(claimData?._id)
      setIsLoadingSpinner(true)
    }
  }

  //Delete Claim mutation
  const deleteClaimMutation = useMutation({
    mutationFn: AdminClaimService.deleteClaim,
    onSuccess: handleDeleteClaimSuccess,
    onError: handleDeleteClaimError
  })

  function handleDeleteClaimSuccess(data: any) {
    if (data?.message) {
      setIsLoadingSpinner(false)
      refetch()
      setClaimData({})
      toast.success('It has been deleted successfully.')
      setOpenConfirmDialog(false)
    } else {
      setIsLoadingSpinner(false)
      refetch()
      setClaimData({})
      setOpenConfirmDialog(false)
      toast.error('Oops! something went wrong.please try again')
    }
  }

  function handleDeleteClaimError(error: any) {
    refetch()
    setClaimData({})
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
    setClaimData({
      distributorPhoto: photo
    })
  }

  // View note dialog box function

  const handleOpenNoteDialogBox = (note?: string) => {
    setViewNote(true)
    setClaimData({
      note
    })
  }

  const handleViewNoteDialogClose = () => {
    setViewNote(false)
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
        src={claimData?.distributorPhoto}
      />

      <ViewNoteDialogBox open={viewNote} handleClose={handleViewNoteDialogClose} note={claimData?.note} />

      <CustomTable
        tableTitle='Claims'
        head={CLAIM_HEAD_DATA}
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
        placeholder='Search Claim'
        buttonLabel='ADD CLAIM'
        onClick={() => router.push('/admin/claims/add')}
        isDateRangePicker
        handleDateRange={handleDateRange}
      >
        {isLoading ? (
          <TableRowLoader rowsNum={rowsPerPage} cellsNum={CLAIM_HEAD_DATA.length} />
        ) : (
          (searchClaim?.data || data)?.claims?.map((row: Claim, index: number) => {
            const { name, photo } = row.distributor!
            const _id = row._id!

            return (
              <ClaimCollapsibleTable
                key={index}
                head={CLAIM_COLLAPSIBLE_HEAD_DATA}
                open={openRows[_id] || false}
                claimId={claimId}
              >
                <StyledTableCell>
                  <IconButton aria-label='expand row' onClick={() => handleRowClick(_id)}>
                    <Icon icon={openRows[_id] ? 'tabler:chevron-up' : 'tabler:chevron-down'} />
                  </IconButton>
                </StyledTableCell>

                <StyledTableCell>{row?.claim_number || 'N/A'}</StyledTableCell>

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
                <StyledTableCell>{row?.total_cost || 0}</StyledTableCell>
                <StyledTableCell>{formatTime(row?.claimed_at) || 'N/A'}</StyledTableCell>
                <StyledTableCell>{formatTime(row?.createdAt) || 'N/A'}</StyledTableCell>

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

                    <IconButton LinkComponent={Link} href={`edit/${row?._id}`}>
                      <Icon icon='mdi:edit' />
                    </IconButton>
                    <IconButton onClick={() => handleOpenConfirmationBox(row?._id)}>
                      <Icon icon='mdi:trash' />
                    </IconButton>
                  </Box>
                </StyledTableCell>
              </ClaimCollapsibleTable>
            )
          })
        )}
      </CustomTable>
    </>
  )
}

export default ClaimTable
