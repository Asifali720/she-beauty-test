'use client'
import { useState } from 'react'

import Image from 'next/image'

import { Box, IconButton } from '@mui/material'

import { toast } from 'react-toastify'

import { useMutation, useQuery } from '@tanstack/react-query'

import Icon from '@core/components/icon'

import { SR_HEAD_DATA } from '@/table-head-data/data'

import CustomTable from './CustomTable'
import { StyledTableCell } from './MuiTableCellStyle'
import { StyledTableRow } from './MuiTableRowStyle'
import { ImageViewDialogBox, Spinner, TableRowLoader, ViewNoteDialogBox } from '.'
import type { SalesRepresentative } from '@/types/sales-representative'
import { AdminSrService } from '@/services'
import ConfirmationDialog from '../confirmation-dialog'
import { useDebounce } from '@/@core/hooks/useDebounce'
import { formatTime } from '@/@core/utils/format'

const SalesRepresentativeTable = () => {
  // ** States
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [pageNo, setPageNo] = useState<number>(1)
  const [viewImage, setViewImage] = useState(false)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isLoadingSpinner, setIsLoadingSpinner] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [salesRepresentative, setSalesRepresentative] = useState<SalesRepresentative>()
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
    queryKey: ['trashTableSalesRepresentative', pageNo, rowsPerPage],
    queryFn: () => AdminSrService.getTrashSalesRepresentative(pageNo, rowsPerPage)
  })

  if (isError) toast.error(error.message || 'Oops! something went wrong')

  // function to Restore SalesRepresentatives
  const handleOpenConfirmationBox = (_id?: string) => {
    setOpenConfirmDialog(true)
    setSalesRepresentative({ _id })
  }

  const handleRestore = () => {
    if (salesRepresentative?._id) {
      restoreSalesRepresentativeMutation.mutate(salesRepresentative?._id)
      setIsLoadingSpinner(true)
    }
  }

  //Restore SalesRepresentative  mutation
  const restoreSalesRepresentativeMutation = useMutation({
    mutationFn: AdminSrService.recoverTrashSalesRepresentative,
    onSuccess: handleRestoreSalesRepresentativeSuccess,
    onError: handleRestoreSalesRepresentativeError
  })

  function handleRestoreSalesRepresentativeSuccess(data: any) {
    if (data?.data?.salesRepresentative) {
      setIsLoadingSpinner(false)
      refetch()
      setSalesRepresentative({})
      toast.success('It has been restored successfully.')
      setOpenConfirmDialog(false)
    }
  }

  function handleRestoreSalesRepresentativeError(error: any) {
    refetch()
    setSalesRepresentative({})
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
    setSalesRepresentative({
      photo
    })
  }

  // View note dialog box function

  const handleOpenNoteDialogBox = (note?: string) => {
    setViewNote(true)
    setSalesRepresentative({
      note
    })
  }

  const handleViewNoteDialogClose = () => {
    setViewNote(false)
  }

  //use Query for Trash SalesRepresentative searching
  const searchTrashSalesRepresentative = useQuery({
    queryKey: ['trashSalesRepresentativeSearch', debounceSearch],
    queryFn: () => AdminSrService.searchSalesRepresentative(debounceSearch, 'deleted'),
    enabled: Boolean(debounceSearch)
  })

  if (searchTrashSalesRepresentative?.isError)
    toast.error(searchTrashSalesRepresentative?.error.message || 'Oops! something went wrong')

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
        src={salesRepresentative?.photo}
      />

      <ViewNoteDialogBox open={viewNote} handleClose={handleViewNoteDialogClose} note={salesRepresentative?.note} />

      <CustomTable
        tableTitle='Sales Representatives'
        head={SR_HEAD_DATA}
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
        placeholder='Search Sales Representative'
        isButton={false}
      >
        {isLoading ? (
          <TableRowLoader rowsNum={rowsPerPage} cellsNum={SR_HEAD_DATA.length} />
        ) : (
          (searchTrashSalesRepresentative?.data || data)?.salesRepresentatives?.map(
            (row: SalesRepresentative, index: number) => {
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
            }
          )
        )}
      </CustomTable>
    </>
  )
}

export default SalesRepresentativeTable
