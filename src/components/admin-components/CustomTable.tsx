// ** MUI Imports
import type { ChangeEventHandler } from 'react'

import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'

import TableContainer from '@mui/material/TableContainer'

import { Card, CardHeader, CircularProgress, Stack, TablePagination } from '@mui/material'

import { StyledTableCell } from './MuiTableCellStyle'

import Toolbar from './Toolbar'

type Props = {
  head: string[]
  count: number
  rowsPerPage: number
  page: number
  handleChangePage: (newPage: number) => void
  handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void
  isFetching: boolean
  children: any
  tableTitle?: string
  value?: string
  clearSearch?: () => void
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> | undefined
  placeholder?: string
  buttonLabel?: string
  onClick?: () => void
  isButton?: boolean
  handleDateRange?: (startDate: Date | null, endDate: Date | null) => void
  isDateRangePicker?: boolean
  isSearchField?: boolean
}

const CustomTable = ({
  head,
  count,
  rowsPerPage,
  page,
  handleChangePage,
  handleChangeRowsPerPage,
  isFetching,
  children,
  tableTitle,
  placeholder,
  buttonLabel,
  onChange,
  clearSearch,
  value,
  isButton = true,
  onClick,
  handleDateRange,
  isDateRangePicker,
  isSearchField = true
}: Props) => {
  return (
    <Card>
      <CardHeader title={tableTitle} />

      <Toolbar
        placeholder={placeholder}
        buttonLabel={buttonLabel}
        onChange={onChange}
        clearSearch={clearSearch}
        value={value}
        onClick={onClick}
        isButton={isButton}
        isSearchField={isSearchField}
        handleDateRange={(startDate: Date | null, endDate: Date | null) => handleDateRange!(startDate, endDate)}
        isDateRangePicker={isDateRangePicker}
      />

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
      <Stack direction='row' justifyContent='flex-end' alignItems='center' spacing={2} pb='10px'>
        {isFetching && <CircularProgress size={'30px'} />}
        <TablePagination
          rowsPerPageOptions={[20, 50, 100]}
          component='div'
          count={count || 0}
          rowsPerPage={rowsPerPage}
          page={!page ? 0 : page - 1}
          onPageChange={(_, newPage) => handleChangePage(newPage + 1)}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Stack>
    </Card>
  )
}

export default CustomTable
