'use client'
import { useState } from 'react'

import Image from 'next/image'

import { Box, IconButton } from '@mui/material'

import { toast } from 'react-toastify'

import { useMutation, useQuery } from '@tanstack/react-query'

import Icon from '@core/components/icon'

import { VENDOR_HEAD_DATA } from '@/table-head-data/data'

import CustomTable from './CustomTable'
import { StyledTableCell } from './MuiTableCellStyle'
import { StyledTableRow } from './MuiTableRowStyle'
import { ImageViewDialogBox, Spinner, TableRowLoader, ViewNoteDialogBox } from '.'
import type { Vendor } from '@/types/vendor'
import { AdminVendorService } from '@/services'
import ConfirmationDialog from '../confirmation-dialog'
import { useDebounce } from '@/@core/hooks/useDebounce'
import { formatTime } from '@/@core/utils/format'

const VendorTable = () => {
  // ** States
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [pageNo, setPageNo] = useState<number>(1)
  const [viewImage, setViewImage] = useState(false)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isLoadingSpinner, setIsLoadingSpinner] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [vendor, setVendor] = useState<Vendor>()
  const [viewNote, setViewNote] = useState(false)

  const debounceSearch = useDebounce(searchValue)

  //functions for pangination
  const handleChangePage = (newPage: number) => {
    setPageNo(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)

    setPageNo(1)
  }

  //use Query
  const { data, error, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['trashVendor', pageNo, rowsPerPage],
    queryFn: () => AdminVendorService.getTrashVendors(pageNo, rowsPerPage)
  })

  if (isError) toast.error(error.message || 'Oops! something went wrong')

  // function to Restore Vendors
  const handleOpenConfirmationBox = (_id?: string) => {
    setOpenConfirmDialog(true)
    setVendor({ _id })
  }

  const handleRestore = () => {
    if (vendor?._id) {
      restoreVendorMutation.mutate(vendor?._id)
      setIsLoadingSpinner(true)
    }
  }

  //Restore vendor  mutation
  const restoreVendorMutation = useMutation({
    mutationFn: AdminVendorService.restoreVendor,
    onSuccess: handleRestoreVendorSuccess,
    onError: handleRestoreVendorError
  })

  function handleRestoreVendorSuccess(data: any) {
    if (data?.data?.vendor) {
      setIsLoadingSpinner(false)
      refetch()
      setVendor({})
      toast.success('It has been restored successfully.')
      setOpenConfirmDialog(false)
    }
  }

  function handleRestoreVendorError(error: any) {
    refetch()
    setVendor({})
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
    setVendor({
      photo
    })
  }

  // View note dialog box function

  const handleOpenNoteDialogBox = (note?: string) => {
    setViewNote(true)
    setVendor({
      note
    })
  }

  const handleViewNoteDialogClose = () => {
    setViewNote(false)
  }

  //use Query for Trash Vendor searching
  const searchTrashVendor = useQuery({
    queryKey: ['trashVendorSearch', debounceSearch],
    queryFn: () => AdminVendorService.searchVendors(debounceSearch, 'deleted'),
    enabled: Boolean(debounceSearch)
  })

  if (searchTrashVendor?.isError) toast.error(searchTrashVendor?.error.message || 'Oops! something went wrong')

  return (
    <>
      <Spinner open={isLoadingSpinner} />

      <ConfirmationDialog
        open={openConfirmDialog}
        setOpen={setOpenConfirmDialog}
        type='restore-it'
        confrimation={handleRestore}
      />

      <ImageViewDialogBox
        openImageViewBox={viewImage}
        handleImageViewClose={handleImageViewDialogClose}
        src={vendor?.photo}
      />

      <ViewNoteDialogBox open={viewNote} handleClose={handleViewNoteDialogClose} note={vendor?.note} />

      <CustomTable
        tableTitle='Vendors'
        head={VENDOR_HEAD_DATA}
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
        placeholder='Search Vendor'
        isButton={false}
      >
        {isLoading ? (
          <TableRowLoader rowsNum={rowsPerPage} cellsNum={VENDOR_HEAD_DATA.length} />
        ) : (
          (searchTrashVendor?.data || data)?.vendors?.map((row: Vendor, index: number) => {
            return (
              <StyledTableRow key={index}>
                <StyledTableCell>
                  <Box display='flex' flexDirection='row' alignItems='center' gap={4}>
                    {row?.photo ? (
                      <Image
                        src={row?.photo}
                        alt={row?.name || ''}
                        width={40}
                        height={40}
                        className='w-[40px] h-[40px] cursor-pointer'
                        unoptimized
                        onClick={() => handleImageViewDialogOpen(row?.photo)}
                      />
                    ) : (
                      <Box sx={{ width: '40px', height: '40px', bgcolor: 'background.default' }} />
                    )}

                    {row?.name}
                  </Box>
                </StyledTableCell>
                <StyledTableCell>{row?.phone_no || 'N/A'}</StyledTableCell>
                <StyledTableCell>{row?.email || 'N/A'}</StyledTableCell>
                <StyledTableCell>{row?.address || 'N/A'}</StyledTableCell>
                <StyledTableCell>{row?.balance_amount || 0}</StyledTableCell>
                <StyledTableCell>{row?.last_paid_amount || 0}</StyledTableCell>
                <StyledTableCell>{formatTime(row?.last_paid) || 'N/A'}</StyledTableCell>
                <StyledTableCell>{formatTime(row?.createdAt) || 'N/A'}</StyledTableCell>
                <StyledTableCell>{formatTime(row?.updatedAt) || 'N/A'}</StyledTableCell>
                <StyledTableCell>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <IconButton
                      onClick={() => {
                        handleOpenNoteDialogBox(row?.note)
                      }}
                      disabled={Boolean(!row?.note)}
                    >
                      <Icon icon='fluent:comment-note-24-filled' />
                    </IconButton>

                    <IconButton onClick={() => handleOpenConfirmationBox(row?._id)}>
                      <Icon icon='la:trash-restore-alt' />
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

export default VendorTable
