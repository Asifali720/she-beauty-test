'use client'
import { useState } from 'react'

import { useRouter } from 'next/navigation'

import Image from 'next/image'

import Link from 'next/link'

import { Box, IconButton } from '@mui/material'

import { useMutation, useQuery } from '@tanstack/react-query'

import { toast } from 'react-toastify'

import Icon from '@core/components/icon'

import { PRODUCT_COLLAPSIBLE_HEAD_DATA, PRODUCT_HEAD_DATA } from '@/table-head-data/data'

import type { Product } from '@/types/product'

import CustomTable from './CustomTable'
import ProductCollapsibleTable from './ProductCollapsibleTable'
import { StyledTableCell } from './MuiTableCellStyle'

import ImageViewDialogBox from './ImageViewDialogBox'
import { Spinner, TableRowLoader } from '.'
import { AdminProductService } from '@/services'
import ConfirmationDialog from '../confirmation-dialog'
import { useDebounce } from '@/@core/hooks/useDebounce'
import { formatTime } from '@/@core/utils/format'

const ProductTable = () => {
  // ** States
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [pageNo, setPageNo] = useState<number>(1)
  const [openRows, setOpenRows] = useState<Record<number, boolean>>({})
  const [searchValue, setSearchValue] = useState<string>('')
  const [viewImage, setViewImage] = useState(false)
  const [isLoadingSpinner, setIsLoadingSpinner] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)

  const debounceSearch = useDebounce(searchValue)
  const [productData, setProductData] = useState<Product>({})

  const router = useRouter()

  //functions for pangination
  const handleChangePage = (newPage: number) => {
    setPageNo(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)

    setPageNo(1)
  }

  //use Query for product data
  const { data, error, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['products', pageNo, rowsPerPage],
    queryFn: () => AdminProductService.getProducts(pageNo, rowsPerPage)
  })

  if (isError) toast.error(error.message || 'Oops! something went wrong')

  // Toggle state for clicked row
  const handleRowClick = (id: number) => {
    setOpenRows({ ...openRows, [id]: !openRows[id] })
  }

  //Image view dialog box function
  const handleImageViewDialogClose = () => {
    setViewImage(false)
  }

  const handleImageViewDialogOpen = (photo: string) => {
    setViewImage(true)
    setProductData({
      photo
    })
  }

  // function to delete Product
  const handleOpenConfirmationBox = (_id?: string) => {
    setOpenConfirmDialog(true)
    setProductData({ _id })
  }

  const handleDelete = () => {
    if (productData?._id) {
      deleteProductMutation.mutate(productData?._id)
      setIsLoadingSpinner(true)
    }
  }

  //Delete Product mutation
  const deleteProductMutation = useMutation({
    mutationFn: AdminProductService.deleteProduct,
    onSuccess: handleDeleteProductSuccess,
    onError: handleDeleteProductError
  })

  function handleDeleteProductSuccess(data: any) {
    if (data?.data?.product) {
      setIsLoadingSpinner(false)
      refetch()
      setProductData({})
      toast.success('It has been deleted successfully.')
      setOpenConfirmDialog(false)
    } else {
      setIsLoadingSpinner(false)
      refetch()
      setProductData({})
      setOpenConfirmDialog(false)
      toast.error('Oops! something went wrong.please try again')
    }
  }

  function handleDeleteProductError(error: any) {
    refetch()
    setProductData({})
    setIsLoadingSpinner(false)
    setOpenConfirmDialog(false)

    if (error.response.data.error)
      toast.error(error.response.data.error || 'Oops! something went wrong.please try again')
  }

  //use Query for Product searching
  const searchProduct = useQuery({
    queryKey: ['productSearch', debounceSearch],
    queryFn: () => AdminProductService.searchProducts(debounceSearch),
    enabled: Boolean(debounceSearch)
  })

  if (searchProduct?.isError) toast.error(searchProduct?.error.message || 'Oops! something went wrong')

  return (
    <>
      <Spinner open={isLoadingSpinner} />

      <ImageViewDialogBox
        openImageViewBox={viewImage}
        handleImageViewClose={handleImageViewDialogClose}
        src={productData?.photo}
      />

      <ConfirmationDialog
        open={openConfirmDialog}
        setOpen={setOpenConfirmDialog}
        type='delete-it'
        confrimation={handleDelete}
      />

      <CustomTable
        tableTitle='Products'
        head={PRODUCT_HEAD_DATA}
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
        placeholder='Search Product'
        buttonLabel='ADD PRODUCT'
        onClick={() => router.push('/admin/products/add')}
      >
        {isLoading ? (
          <TableRowLoader rowsNum={rowsPerPage} cellsNum={PRODUCT_HEAD_DATA.length} />
        ) : (
          <>
            {(searchProduct?.data || data)?.products?.map((row: Product, index: number) => {
              return (
                <ProductCollapsibleTable
                  key={index}
                  head={PRODUCT_COLLAPSIBLE_HEAD_DATA}
                  open={openRows[index] || false}
                  data={row?.raw_items}
                >
                  <StyledTableCell>
                    <IconButton aria-label='expand row' onClick={() => handleRowClick(index)}>
                      <Icon icon={openRows[index] ? 'tabler:chevron-up' : 'tabler:chevron-down'} />
                    </IconButton>
                  </StyledTableCell>
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
                  <StyledTableCell>{row?.totalQty || 0}</StyledTableCell>
                  <StyledTableCell>{row?.price}</StyledTableCell>
                  <StyledTableCell>{formatTime(row?.createdAt)}</StyledTableCell>
                  <StyledTableCell>{formatTime(row?.updatedAt)}</StyledTableCell>
                  <StyledTableCell>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <IconButton LinkComponent={Link} href={`edit/${row?._id}`}>
                        <Icon icon='mdi:edit' />
                      </IconButton>
                      <IconButton onClick={() => handleOpenConfirmationBox(row?._id)}>
                        <Icon icon='mdi:trash' />
                      </IconButton>
                    </Box>
                  </StyledTableCell>
                </ProductCollapsibleTable>
              )
            })}
          </>
        )}
      </CustomTable>
    </>
  )
}

export default ProductTable
