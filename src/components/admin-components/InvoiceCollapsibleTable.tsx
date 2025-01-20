import { Fragment } from 'react'

import Image from 'next/image'

import Box from '@mui/material/Box'

// ** MUI Imports

import Table from '@mui/material/Table'
import Collapse from '@mui/material/Collapse'

import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import { useTheme } from '@mui/material'

import { toast } from 'react-toastify'

import { useQuery } from '@tanstack/react-query'

import { StyledTableRow } from './MuiTableRowStyle'
import { StyledTableCell } from './MuiTableCellStyle'
import { AdminInvoiceService } from '@/services'

import TableRowLoader from './TableRowLoader'
import type { InvoiceItems } from '@/types/invoice'

type Props = {
  head: string[]

  open: boolean
  invoiceId: string
  children: any
  onClick?: () => void
}

const InvoiceCollapsibleTable = ({ head, children, open, invoiceId, onClick }: Props) => {
  const theme = useTheme()

  //use Query for getting invoice items
  const { data, error, isLoading, isError } = useQuery({
    queryKey: ['invoiceItems', invoiceId],
    queryFn: () => AdminInvoiceService.getInvoicesItem(invoiceId),
    enabled: Boolean(invoiceId && open)
  })

  if (isError) toast.error(error.message || 'Oops! something went wrong')

  return (
    <Fragment>
      <StyledTableRow hover onClick={onClick}>
        {children}
      </StyledTableRow>

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
                    data?.invoiceItems?.map((item: InvoiceItems, index: number) => {
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
                          <StyledTableCell>{item?.qty}</StyledTableCell>
                          <StyledTableCell>{item?.cost}</StyledTableCell>
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

export default InvoiceCollapsibleTable
