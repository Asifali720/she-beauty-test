'use client'
import { useState } from 'react'

import Image from 'next/image'

import { Box, IconButton } from '@mui/material'

import { useMutation, useQuery } from '@tanstack/react-query'

import { toast } from 'react-toastify'

import Icon from '@core/components/icon'

import { INGREDIENT_HEAD_DATA } from '@/table-head-data/data'

import CustomTable from './CustomTable'
import { StyledTableCell } from './MuiTableCellStyle'
import { StyledTableRow } from './MuiTableRowStyle'
import { ImageViewDialogBox, Spinner, TableRowLoader } from '.'
import { AdminIngredientService } from '@/services'
import type { Ingredient } from '@/types/ingredient'
import ConfirmationDialog from '../confirmation-dialog'
import { useDebounce } from '@/@core/hooks/useDebounce'
import { formatTime } from '@/@core/utils/format'

const IngredientsTrashTable = () => {
  // ** States
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [pageNo, setPageNo] = useState<number>(1)
  const [viewImage, setViewImage] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [searchValue, setSearchValue] = useState<string>('')
  const [ingredient, setIngredient] = useState<Ingredient>()
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
    queryKey: ['AllTrashIngredientTable', pageNo, rowsPerPage],
    queryFn: () => AdminIngredientService.getTrashIngredient(pageNo, rowsPerPage)
  })

  if (isError) toast.error(error.message || 'Oops! something went wrong')

  // function to Restore ingredients
  const handleOpenConfirmationBox = (_id?: string) => {
    setOpenConfirmDialog(true)
    setIngredient({ _id })
  }

  const handleRestore = () => {
    if (ingredient?._id) {
      restoreIngredientMutation.mutate(ingredient?._id)
      setIsLoadingSpinner(true)
    }
  }

  //Restore ingredients mutation
  const restoreIngredientMutation = useMutation({
    mutationFn: AdminIngredientService.recoverTrashIngredient,
    onSuccess: handleRestoreIngredientSuccess,
    onError: handleRestoreIngredientError
  })

  function handleRestoreIngredientSuccess(data: any) {
    if (data?.data?.ingredient) {
      setIsLoadingSpinner(false)
      refetch()
      setIngredient({})
      toast.success('It has been restored successfully.')
      setOpenConfirmDialog(false)
    }
  }

  function handleRestoreIngredientError(error: any) {
    refetch()
    setIngredient({})
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
    setIngredient({
      photo
    })
  }

  //use Query for Trash ingredient searching
  const searchTrashIngredient = useQuery({
    queryKey: ['trashIngredientSearch', debounceSearch],
    queryFn: () => AdminIngredientService.searchIngredient(debounceSearch, 'deleted'),
    enabled: Boolean(debounceSearch)
  })

  if (searchTrashIngredient?.isError) toast.error(searchTrashIngredient?.error.message || 'Oops! something went wrong')

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
        src={ingredient?.photo}
      />

      <CustomTable
        tableTitle='Ingredients'
        head={INGREDIENT_HEAD_DATA}
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
        placeholder='Search Ingredients'
        isButton={false}
      >
        {isLoading ? (
          <TableRowLoader rowsNum={rowsPerPage} cellsNum={INGREDIENT_HEAD_DATA.length} />
        ) : (
          (searchTrashIngredient?.data || data)?.ingredients?.map((row: Ingredient) => {
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
                <StyledTableCell>
                  {row?.quantity || 0} {row?.measurement_unit}
                </StyledTableCell>
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

export default IngredientsTrashTable
