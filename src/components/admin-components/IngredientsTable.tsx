'use client'
import { useState } from 'react'

import Image from 'next/image'

import { Box, IconButton, useTheme } from '@mui/material'

import { useMutation, useQuery } from '@tanstack/react-query'

import { toast } from 'react-toastify'

import Icon from '@core/components/icon'

import { INGREDIENT_HEAD_DATA } from '@/table-head-data/data'

import CustomTable from './CustomTable'
import { StyledTableCell } from './MuiTableCellStyle'
import { StyledTableRow } from './MuiTableRowStyle'
import { ImageViewDialogBox, IngredientReduceQtyDrawer, IngredientsDrawer, Spinner, TableRowLoader } from '.'
import { AdminIngredientService } from '@/services'
import type { Ingredient } from '@/types/ingredient'
import ConfirmationDialog from '../confirmation-dialog'
import { useDebounce } from '@/@core/hooks/useDebounce'
import { ReduceIcon, ReduceIconDark } from '@/assets/svg'
import { formatTime } from '@/@core/utils/format'

const IngredientsTable = () => {
  // ** States
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [pageNo, setPageNo] = useState<number>(1)
  const [viewImage, setViewImage] = useState(false)
  const [searchValue, setSearchValue] = useState<string>('')
  const [ingredientPopUpOpen, setIngredientPopUpOpen] = useState(false)
  const [ingredientReduceQtyPopUpOpen, setIngredientReduceQtyPopUpOpen] = useState(false)
  const [selectedPopUp, setSelectedPopUp] = useState('add')
  const [ingredient, setIngredient] = useState<Ingredient>()
  const [isLoadingSpinner, setIsLoadingSpinner] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const debounceSearch = useDebounce(searchValue)

  const theme = useTheme()
  const mode = theme.palette.mode

  //functions for pangination
  const handleChangePage = (newPage: number) => {
    setPageNo(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)

    setPageNo(1)
  }

  // function to open pop up for Ingredient
  const handleClose = () => {
    ingredientPopUpOpen && setIngredientPopUpOpen(false)
    ingredientReduceQtyPopUpOpen && setIngredientReduceQtyPopUpOpen(false)
    setIngredient({})
  }

  const handleOpenPopUp = (title: string, data?: Ingredient) => {
    setSelectedPopUp(title)
    setIngredientPopUpOpen(true)
    setIngredient(data)
  }

  const handleReduceQtyPopUp = (data?: Ingredient) => {
    setIngredient(data)
    setIngredientReduceQtyPopUpOpen(true)
  }

  //use Query
  const { data, error, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['allIngredient', pageNo, rowsPerPage],
    queryFn: () => AdminIngredientService.getIngredients(pageNo, rowsPerPage)
  })

  if (isError) toast.error(error.message || 'Oops! something went wrong')

  // function to delete Ingredient
  const handleOpenConfirmationBox = (_id?: string) => {
    setOpenConfirmDialog(true)
    setIngredient({ _id })
  }

  const handleDelete = () => {
    if (ingredient?._id) {
      deleteIngredientMutation.mutate(ingredient?._id)
      setIsLoadingSpinner(true)
    }
  }

  //Delete Ingredient mutation
  const deleteIngredientMutation = useMutation({
    mutationFn: AdminIngredientService.deleteIngredient,
    onSuccess: handleDeleteIngredientSuccess,
    onError: handleDeleteIngredientError
  })

  function handleDeleteIngredientSuccess(data: any) {
    if (data?.data?.ingredient) {
      setIsLoadingSpinner(false)
      refetch()
      setIngredient({})
      toast.success('It has been deleted successfully.')
      setOpenConfirmDialog(false)
    }
  }

  function handleDeleteIngredientError(error: any) {
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

  //use Query for ingredient searching
  const searchIngredient = useQuery({
    queryKey: ['allIngredientSearchTable', debounceSearch],
    queryFn: () => AdminIngredientService.searchIngredient(debounceSearch),
    enabled: Boolean(debounceSearch)
  })

  if (searchIngredient?.isError) toast.error(searchIngredient?.error.message || 'Oops! something went wrong')

  return (
    <>
      <Spinner open={isLoadingSpinner} />

      <IngredientsDrawer
        open={ingredientPopUpOpen}
        handleClose={handleClose}
        selectedPopUp={selectedPopUp}
        refetch={refetch}
        ingredient={ingredient}
      />

      <IngredientReduceQtyDrawer
        open={ingredientReduceQtyPopUpOpen}
        handleClose={handleClose}
        refetch={refetch}
        ingredient={ingredient}
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
        buttonLabel='ADD INGREDIENTS'
        onClick={() => handleOpenPopUp('add')}
      >
        {isLoading ? (
          <TableRowLoader rowsNum={rowsPerPage} cellsNum={INGREDIENT_HEAD_DATA.length} />
        ) : (
          (searchIngredient?.data || data)?.ingredients?.map((row: Ingredient) => {
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
                    <IconButton onClick={() => handleOpenPopUp('edit', row)}>
                      <Icon icon='mdi:edit' />
                    </IconButton>
                    <IconButton onClick={() => handleReduceQtyPopUp(row)}>
                      <Image src={mode === 'light' ? ReduceIcon : ReduceIconDark} alt='reduce' width={20} height={20} />
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

export default IngredientsTable
