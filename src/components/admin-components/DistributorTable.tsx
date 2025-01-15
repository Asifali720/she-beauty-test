'use client'

import { useState } from 'react'

import Image from 'next/image'

import { useRouter } from 'next/navigation'

import { Box, IconButton } from '@mui/material'

import { useMutation, useQuery } from '@tanstack/react-query'

import { toast } from 'react-toastify'

import Icon from '@core/components/icon'

import { DISTRIBUTOR_HEAD_DATA } from '@/table-head-data/data'

import CustomTable from './CustomTable'
import { StyledTableCell } from './MuiTableCellStyle'
import { StyledTableRow } from './MuiTableRowStyle'
import { DistributorDrawer, ImageViewDialogBox, Spinner, TableRowLoader, ViewNoteDialogBox } from '.'
import type { Distributor } from '@/types/distributor'
import { AdminDistributorService } from '@/services'

import ConfirmationDialog from '../confirmation-dialog'
import { useDebounce } from '@/@core/hooks/useDebounce'
import { formatTime } from '@/@core/utils/format'

const DistributorTable = () => {
  // ** States
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [pageNo, setPageNo] = useState<number>(1)
  const [viewImage, setViewImage] = useState(false)
  const [searchValue, setSearchValue] = useState<string>('')
  const [distributorPopUpOpen, setDistributorPopUpOpen] = useState(false)
  const [selectedPopUp, setSelectedPopUp] = useState('add')
  const [distributor, setDistributor] = useState<Distributor>()
  const [isLoadingSpinner, setIsLoadingSpinner] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [viewNote, setViewNote] = useState(false)

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

  // function to open pop up for Distributor
  const handleClose = () => {
    setDistributorPopUpOpen(false)
    setDistributor({})
  }

  const handleOpenPopUp = (title: string, data?: Distributor) => {
    setSelectedPopUp(title)
    setDistributorPopUpOpen(true)
    setDistributor(data)
  }

  //use Query
  const { data, error, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['distributor', pageNo, rowsPerPage],
    queryFn: () => AdminDistributorService.getDistributor(pageNo, rowsPerPage)
  })

  if (isError) toast.error(error.message || 'Oops! something went wrong')

  // function to delete Raw items
  const handleOpenConfirmationBox = (_id?: string) => {
    setOpenConfirmDialog(true)
    setDistributor({ _id })
  }

  const handleDelete = () => {
    if (distributor?._id) {
      deleteDistributorMutation.mutate(distributor?._id)
      setIsLoadingSpinner(true)
    }
  }

  //Delete Raw items mutation
  const deleteDistributorMutation = useMutation({
    mutationFn: AdminDistributorService.deleteDistributor,
    onSuccess: handleDeleteDistributorSuccess,
    onError: handleDeleteDistributorError
  })

  function handleDeleteDistributorSuccess(data: any) {
    if (data?.data?.distributor) {
      setIsLoadingSpinner(false)
      refetch()
      setDistributor({})
      toast.success('It has been deleted successfully.')
      setOpenConfirmDialog(false)
    }
  }

  function handleDeleteDistributorError(error: any) {
    refetch()
    setDistributor({})
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
    setDistributor({
      photo
    })
  }

  // View note dialog box function

  const handleOpenNoteDialogBox = (note?: string) => {
    setViewNote(true)
    setDistributor({
      note
    })
  }

  const handleViewNoteDialogClose = () => {
    setViewNote(false)
  }

  //use Query for Distributor searching
  const searchDistributor = useQuery({
    queryKey: ['distributorSearch', debounceSearch],
    queryFn: () => AdminDistributorService.searchDistributor(debounceSearch),
    enabled: Boolean(debounceSearch)
  })

  if (searchDistributor?.isError) toast.error(searchDistributor?.error.message || 'Oops! something went wrong')

  const handleNavigation = (id?: string) => {
    if (id) router.push(`/admin/distributors/legder/${id}`)
  }

  return (
    <>
      <Spinner open={isLoadingSpinner} />

      <DistributorDrawer
        open={distributorPopUpOpen}
        handleClose={handleClose}
        selectedPopUp={selectedPopUp}
        refetch={refetch}
        distributor={distributor}
      />

      <ImageViewDialogBox
        openImageViewBox={viewImage}
        handleImageViewClose={handleImageViewDialogClose}
        src={distributor?.photo}
      />

      <ConfirmationDialog
        open={openConfirmDialog}
        setOpen={setOpenConfirmDialog}
        type='delete-it'
        confrimation={handleDelete}
      />

      <ViewNoteDialogBox open={viewNote} handleClose={handleViewNoteDialogClose} note={distributor?.note} />

      <CustomTable
        tableTitle='Distributors'
        head={DISTRIBUTOR_HEAD_DATA}
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
        placeholder='Search Distributor'
        buttonLabel='ADD DISTRIBUTOR'
        onClick={() => handleOpenPopUp('add')}
      >
        {isLoading ? (
          <TableRowLoader rowsNum={rowsPerPage} cellsNum={DISTRIBUTOR_HEAD_DATA.length} />
        ) : (
          (searchDistributor?.data || data)?.distributors?.map((row: Distributor, index: number) => {
            return (
              <StyledTableRow
                key={index}
                onClick={() => handleNavigation(row?._id)}
                sx={{
                  cursor: 'pointer'
                }}
              >
                <StyledTableCell>{row?.distributor_number || 'N/A'}</StyledTableCell>

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
                <StyledTableCell>{row?.to_received || 0}</StyledTableCell>
                <StyledTableCell>{row?.last_received_amount || 0}</StyledTableCell>
                <StyledTableCell>{formatTime(row?.last_received) || 0}</StyledTableCell>
                <StyledTableCell>{row?.claimed_amount || 0}</StyledTableCell>
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
                      onClick={e => {
                        e.stopPropagation()
                        handleOpenNoteDialogBox(row?.note)
                      }}
                      disabled={Boolean(!row?.note)}
                    >
                      <Icon icon='fluent:comment-note-24-filled' />
                    </IconButton>

                    <IconButton
                      onClick={e => {
                        e.stopPropagation()
                        handleOpenPopUp('edit', row)
                      }}
                    >
                      <Icon icon='mdi:edit' />
                    </IconButton>
                    <IconButton
                      onClick={e => {
                        e.stopPropagation()
                        handleOpenConfirmationBox(row?._id)
                      }}
                    >
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

export default DistributorTable
