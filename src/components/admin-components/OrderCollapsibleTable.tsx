import { Fragment } from 'react'

import Image from 'next/image'

import Box from '@mui/material/Box'

import Table from '@mui/material/Table'
import Collapse from '@mui/material/Collapse'

import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import { useTheme } from '@mui/material'

import { useQuery } from '@tanstack/react-query'

import { toast } from 'react-toastify'

import { StyledTableRow } from './MuiTableRowStyle'
import { StyledTableCell } from './MuiTableCellStyle'
import { AdminOrderService } from '@/services'
import type { OrderItems } from '@/types/order'
import TableRowLoader from './TableRowLoader'

type Props = {
  head: string[]
  orderId: string
  open: boolean

  children: any
}

const OrderCollapsibleTable = ({ head, children, open, orderId }: Props) => {
  const theme = useTheme()

  //use Query for getting order items
  const { data, error, isLoading, isError } = useQuery({
    queryKey: ['orderItems', orderId],
    queryFn: () => AdminOrderService.getOrdersItem(orderId),
    enabled: Boolean(orderId && open)
  })

  if (isError) toast.error(error.message || 'Oops! something went wrong')

  return (
    <Fragment>
      <StyledTableRow hover>{children}</StyledTableRow>

      <StyledTableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <StyledTableCell
          style={{
            padding: open ? '20px' : '0px'
          }}
          colSpan={10}
        >
          <Collapse in={open} timeout='auto' unmountOnExit>
            <Box
              sx={{
                m: 2,
                borderRadius: '10px',
                border: '1px solid ',
                borderColor: theme.palette.divider,
                overflow: 'hidden'
              }}
            >
              <Table stickyHeader aria-label='purchases'>
                <TableHead>
                  <StyledTableRow>
                    {head.map((item, index) => (
                      <StyledTableCell key={index}>{item}</StyledTableCell>
                    ))}
                  </StyledTableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRowLoader rowsNum={5} cellsNum={head.length} />
                  ) : (
                    data?.orderItems?.map((item: OrderItems, index: number) => {
                      const { name, photo, sku } = item?.product

                      return (
                        <StyledTableRow
                          key={index}
                          hover
                          sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}
                        >
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
                      />
                    ) : (
                      <Box sx={{ width: '40px', height: '40px', bgcolor: 'background.default' }} />
                    )}

                    {name}
                  </Box>
                </StyledTableCell>
                          <StyledTableCell>{sku}</StyledTableCell>
                          <StyledTableCell>{item?.qty || 0}</StyledTableCell>
                          <StyledTableCell>{item?.cost || 0}</StyledTableCell>
                        </StyledTableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </StyledTableCell>
      </StyledTableRow>
    </Fragment>
  )
}

export default OrderCollapsibleTable
