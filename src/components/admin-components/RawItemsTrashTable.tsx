'use client'
import { useState } from 'react'

import Image from 'next/image'

import { Box, IconButton } from '@mui/material'

import { useMutation, useQuery } from '@tanstack/react-query'

import { toast } from 'react-toastify'

import Icon from '@core/components/icon'

import { RAW_ITEMS_HEAD_DATA } from '@/table-head-data/data'

import CustomTable from './CustomTable'
import { StyledTableCell } from './MuiTableCellStyle'
import { StyledTableRow } from './MuiTableRowStyle'
import { ImageViewDialogBox, Spinner, TableRowLoader } from '.'
import { AdminRawItemsService } from '@/services'

import { formatTime } from '@core/utils/format'

import type { RawItems } from '@/types/rawItems'
import ConfirmationDialog from '../confirmation-dialog'
import { useDebounce } from '@/@core/hooks/useDebounce'

const RawItemsTrashTable = () => {
  // ** States
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [pageNo, setPageNo] = useState<number>(1)
  const [viewImage, setViewImage] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [searchValue, setSearchValue] = useState<string>('')
  const [rawItems, setRawItems] = useState<RawItems>()
  const [isLoadingSpinner, setIsLoadingSpinner] = useState(false)

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
    queryKey: ['trashRawItems', pageNo, rowsPerPage],
    queryFn: () => AdminRawItemsService.getTrashRawItems(pageNo, rowsPerPage)
  })

  if (isError) toast.error(error.message || 'Oops! something went wrong')

  // function to Restore Raw items
  const handleOpenConfirmationBox = (_id?: string) => {
    setOpenConfirmDialog(true)
    setRawItems({ _id })
  }

  const handleRestore = () => {
    if (rawItems?._id) {
      restoreRawItemsMutation.mutate(rawItems?._id)
      setIsLoadingSpinner(true)
    }
  }

  //Restore Raw items mutation
  const restoreRawItemsMutation = useMutation({
    mutationFn: AdminRawItemsService.recoverTrashRawItems,
    onSuccess: handleRestoreRawItemsSuccess,
    onError: handleRestoreRawItemsError
  })

  function handleRestoreRawItemsSuccess(data: any) {
    if (data?.data?.rawItem) {
      setIsLoadingSpinner(false)
      refetch()
      setRawItems({})
      toast.success('It has been restored successfully.')
      setOpenConfirmDialog(false)
    }
  }

  function handleRestoreRawItemsError(error: any) {
    refetch()
    setRawItems({})
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
    setRawItems({
      photo
    })
  }

  //use Query for Trash rawitems searching
  const searchTrashRawItems = useQuery({
    queryKey: ['trashRawItemsSearch', debounceSearch],
    queryFn: () => AdminRawItemsService.searchRawItems(debounceSearch, 'deleted'),
    enabled: Boolean(debounceSearch)
  })

  if (searchTrashRawItems?.isError) toast.error(searchTrashRawItems?.error.message || 'Oops! something went wrong')

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
        src={rawItems?.photo}
      />

      <CustomTable
        tableTitle='Raw Items'
        head={RAW_ITEMS_HEAD_DATA}
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
        placeholder='Search Raw Items'
        isButton={false}
      >
        {isLoading ? (
          <TableRowLoader rowsNum={rowsPerPage} cellsNum={RAW_ITEMS_HEAD_DATA.length} />
        ) : (
          (searchTrashRawItems?.data || data)?.rawItems?.map((row: RawItems) => {
            return (
              <StyledTableRow key={row?._id}>
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

                <StyledTableCell>{row?.sku}</StyledTableCell>
                <StyledTableCell>{row?.quantity || 0}</StyledTableCell>
                <StyledTableCell>{`${row?.cost?.lowest} - ${row?.cost?.highest}` || 0}</StyledTableCell>
                <StyledTableCell>{formatTime(row?.createdAt) || 'N/A'}</StyledTableCell>
                <StyledTableCell>{formatTime(row?.updatedAt) || 'N/A'}</StyledTableCell>
                <StyledTableCell>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
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

export default RawItemsTrashTable
