// ** MUI Imports
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'

import TableContainer from '@mui/material/TableContainer'

import type { SxProps } from '@mui/material'
import { Card } from '@mui/material'

import { StyledTableCell } from './MuiTableCellStyle'

type Props = {
  head: string[]
  children: any
  sx?: SxProps
}

const LegderTable = ({ head, children, sx }: Props) => {
  return (
    <Card sx={{ ...sx }}>
      <TableContainer
        sx={{
          '&::-webkit-scrollbar': {
            height: '6px',
            bgcolor: 'transparent'
          },

          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'var(--mui-palette-divider)',
            borderRadius: '6px'
          },
          '&::-webkit-scrollbar-thumb:hover': {
            bgcolor: 'var(--mui-palette-action-disabled) !important'
          },

          '&::-webkit-scrollbar-track': {
            borderRadius: '6px'
          }
        }}
      >
        <Table aria-label='table' stickyHeader>
          <TableHead>
            <TableRow>
              {head.map((item, index) => (
                <StyledTableCell key={index}>{item}</StyledTableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>{children}</TableBody>
        </Table>
      </TableContainer>
    </Card>
  )
}

export default LegderTable
