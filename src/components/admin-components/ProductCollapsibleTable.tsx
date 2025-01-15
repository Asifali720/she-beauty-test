import { Fragment } from 'react'

import Image from 'next/image'

import Box from '@mui/material/Box'

// ** MUI Imports

import Table from '@mui/material/Table'
import Collapse from '@mui/material/Collapse'

import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'

import { useTheme } from '@mui/material'

import { StyledTableRow } from './MuiTableRowStyle'
import { StyledTableCell } from './MuiTableCellStyle'
import type { RawItems } from '@/types/rawItems'

type Props = {
  head: string[]

  open: boolean
  data?: RawItems[]
  children: any
}

const ProductCollapsibleTable = ({ head, children, open, data }: Props) => {
  const theme = useTheme()

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
                  {data?.map((item: RawItems, index) => {
                    return (
                      <StyledTableRow
                        key={index}
                        hover
                        sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}
                      >
                        <StyledTableCell>
                          <Box display='flex' flexDirection='row' alignItems='center' gap={4}>
                            {item?.raw_item?.photo ? (
                              <Image
                                src={item?.raw_item?.photo}
                                alt={item?.raw_item?.name || ''}
                                width={40}
                                height={40}
                                className='w-[40px] h-[40px] cursor-pointer'
                                unoptimized
                              />
                            ) : (
                              <Box sx={{ width: '40px', height: '40px', bgcolor: 'background.default' }} />
                            )}

                            {item?.raw_item?.name}
                          </Box>
                        </StyledTableCell>
                        <StyledTableCell>{item?.raw_item?.sku}</StyledTableCell>
                        <StyledTableCell>{item?.quantity}</StyledTableCell>
                      </StyledTableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </StyledTableCell>
      </StyledTableRow>
    </Fragment>
  )
}

export default ProductCollapsibleTable
