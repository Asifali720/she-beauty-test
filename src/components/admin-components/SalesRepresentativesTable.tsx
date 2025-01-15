'use client'

import { useState } from 'react'

import Image from 'next/image'

import { Box, IconButton } from '@mui/material'

import { useMutation, useQuery } from '@tanstack/react-query'

import { toast } from 'react-toastify'

import Icon from '@core/components/icon'
import { SR_HEAD_DATA } from '@/table-head-data/data'
import CustomTable from './CustomTable'
import { StyledTableCell } from './MuiTableCellStyle'
import { StyledTableRow } from './MuiTableRowStyle'
import { SalesRepresentativeDrawer, ImageViewDialogBox, Spinner, TableRowLoader, ViewNoteDialogBox } from '.'
import type { SalesRepresentative } from '@/types/sales-representative'
import { AdminSrService } from '@/services'
import ConfirmationDialog from '../confirmation-dialog'
import { useDebounce } from '@/@core/hooks/useDebounce'
import { formatTime } from '@/@core/utils/format'

const SalesRepresentativesTable = () => {
  // ** States
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [pageNo, setPageNo] = useState<number>(1)
  const [viewImage, setViewImage] = useState(false)
  const [searchValue, setSearchValue] = useState<string>('')
  const [salesRepresentativePopUpOpen, setSalesRepresentativePopUpOpen] = useState(false)
  const [selectedPopUp, setSelectedPopUp] = useState('add')
  const [salesRepresentative, setSalesRepresentative] = useState<SalesRepresentative>()
  const [isLoadingSpinner, setIsLoadingSpinner] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
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

  // function to open pop up for SalesRepresentative
  const handleClose = () => {
    setSalesRepresentativePopUpOpen(false)
    setSalesRepresentative({})
  }

  const handleOpenPopUp = (title: string, data?: SalesRepresentative) => {
    setSelectedPopUp(title)
    setSalesRepresentativePopUpOpen(true)
    setSalesRepresentative(data)
  }

  //use Query
  const { data, error, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['salesRepresentative', pageNo, rowsPerPage],
    queryFn: () => AdminSrService.getSalesRepresentative(pageNo, rowsPerPage)
  })

  if (isError) toast.error(error.message || 'Oops! something went wrong')

  // function to delete Raw items
  const handleOpenConfirmationBox = (_id?: string) => {
    setOpenConfirmDialog(true)
    setSalesRepresentative({ _id })
  }

  const handleDelete = () => {
    if (salesRepresentative?._id) {
      deleteSalesRepresentativeMutation.mutate(salesRepresentative?._id)
      setIsLoadingSpinner(true)
    }
  }

  //Delete Raw items mutation
  const deleteSalesRepresentativeMutation = useMutation({
    mutationFn: AdminSrService.deleteSalesRepresentative,
    onSuccess: handleDeleteSalesRepresentativeSuccess,
    onError: handleDeleteSalesRepresentativeError
  })

  function handleDeleteSalesRepresentativeSuccess(data: any) {
    if (data?.data?.salesRepresentative) {
      setIsLoadingSpinner(false)
      refetch()
      setSalesRepresentative({})
      toast.success('It has been deleted successfully.')
      setOpenConfirmDialog(false)
    }
  }

  function handleDeleteSalesRepresentativeError(error: any) {
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

  //use Query for SalesRepresentative searching
  const searchSalesRepresentative = useQuery({
    queryKey: ['salesRepresentativeSearchTable', debounceSearch],
    queryFn: () => AdminSrService.searchSalesRepresentative(debounceSearch),
    enabled: Boolean(debounceSearch)
  })

  if (searchSalesRepresentative?.isError)
    toast.error(searchSalesRepresentative?.error.message || 'Oops! something went wrong')

  return (
    <>
      <Spinner open={isLoadingSpinner} />

      <SalesRepresentativeDrawer
        open={salesRepresentativePopUpOpen}
        handleClose={handleClose}
        selectedPopUp={selectedPopUp}
        refetch={refetch}
        salesRepresentative={salesRepresentative}
      />

      <ImageViewDialogBox
        openImageViewBox={viewImage}
        handleImageViewClose={handleImageViewDialogClose}
        src={salesRepresentative?.photo}
      />

      <ConfirmationDialog
        open={openConfirmDialog}
        setOpen={setOpenConfirmDialog}
        type='delete-it'
        confrimation={handleDelete}
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
        buttonLabel='ADD SALES REPRESENTATIVE'
        onClick={() => handleOpenPopUp('add')}
      >
        {isLoading ? (
          <TableRowLoader rowsNum={rowsPerPage} cellsNum={SR_HEAD_DATA.length} />
        ) : (
          (searchSalesRepresentative?.data || data)?.salesRepresentatives?.map(
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
                  <StyledTableCell>{row?.email || 'N/A'} </StyledTableCell>
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
            }
          )
        )}
      </CustomTable>
    </>
  )
}

export default SalesRepresentativesTable
