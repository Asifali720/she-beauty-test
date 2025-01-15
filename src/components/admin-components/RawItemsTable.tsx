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
import { ImageViewDialogBox, RawItemsDrawer, Spinner, TableRowLoader } from '.'
import { AdminRawItemsService } from '@/services'

import { formatTime } from '@core/utils/format'

import type { RawItems } from '@/types/rawItems'
import ConfirmationDialog from '../confirmation-dialog'
import { useDebounce } from '@/@core/hooks/useDebounce'

const RawItemsTable = () => {
  // ** States
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [pageNo, setPageNo] = useState<number>(1)
  const [viewImage, setViewImage] = useState(false)
  const [searchValue, setSearchValue] = useState<string>('')
  const [rawItemsPopUpOpen, setRawItemsPopUpOpen] = useState(false)
  const [selectedPopUp, setSelectedPopUp] = useState('add')
  const [rawItems, setRawItems] = useState<RawItems>()
  const [isLoadingSpinner, setIsLoadingSpinner] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)

  const debounceSearch = useDebounce(searchValue)

  //functions for pangination
  const handleChangePage = (newPage: number) => {
    setPageNo(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)

    setPageNo(1)
  }

  // function to open pop up for RawItems
  const handleClose = () => {
    setRawItemsPopUpOpen(false)
    setRawItems({})
  }

  const handleOpenPopUp = (title: string, data?: RawItems) => {
    setSelectedPopUp(title)
    setRawItemsPopUpOpen(true)
    setRawItems(data)
  }

  //use Query
  const { data, error, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['rawItems', pageNo, rowsPerPage],
    queryFn: () => AdminRawItemsService.getRawItems(pageNo, rowsPerPage)
  })

  if (isError) toast.error(error.message || 'Oops! something went wrong')

  // function to delete Raw items
  const handleOpenConfirmationBox = (_id?: string) => {
    setOpenConfirmDialog(true)
    setRawItems({ _id })
  }

  const handleDelete = () => {
    if (rawItems?._id) {
      deleteRawItemsMutation.mutate(rawItems?._id)
      setIsLoadingSpinner(true)
    }
  }

  //Delete Raw items mutation
  const deleteRawItemsMutation = useMutation({
    mutationFn: AdminRawItemsService.deleteRawItems,
    onSuccess: handleDeleteRawItemsSuccess,
    onError: handleDeleteRawItemsError
  })

  function handleDeleteRawItemsSuccess(data: any) {
    if (data?.data?.rawItem) {
      setIsLoadingSpinner(false)
      refetch()
      setRawItems({})
      toast.success('It has been deleted successfully.')
      setOpenConfirmDialog(false)
    }
  }

  function handleDeleteRawItemsError(error: any) {
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

  //use Query for rawitems searching
  const searchRawItems = useQuery({
    queryKey: ['rawItemsSearchTable', debounceSearch],
    queryFn: () => AdminRawItemsService.searchRawItems(debounceSearch),
    enabled: Boolean(debounceSearch)
  })

  if (searchRawItems?.isError) toast.error(searchRawItems?.error.message || 'Oops! something went wrong')

  return (
    <>
      <Spinner open={isLoadingSpinner} />

      <RawItemsDrawer
        open={rawItemsPopUpOpen}
        handleClose={handleClose}
        selectedPopUp={selectedPopUp}
        refetch={refetch}
        rawItems={rawItems}
      />

      <ConfirmationDialog
        open={openConfirmDialog}
        setOpen={setOpenConfirmDialog}
        type='delete-it'
        confrimation={handleDelete}
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
        buttonLabel='ADD RAW ITEMS'
        onClick={() => handleOpenPopUp('add')}
      >
        {isLoading ? (
          <TableRowLoader rowsNum={rowsPerPage} cellsNum={RAW_ITEMS_HEAD_DATA.length} />
        ) : (
          (searchRawItems?.data || data)?.rawItems?.map((row: RawItems) => {
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
          })
        )}
      </CustomTable>
    </>
  )
}

export default RawItemsTable
