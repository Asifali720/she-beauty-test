import { TableRow, TableCell, Skeleton } from '@mui/material'

type Props = {
  rowsNum: number
  cellsNum: number
}

const TableRowsLoader = ({ rowsNum, cellsNum }: Props) => {
  return [...Array(rowsNum)].map((row, index) => (
    <TableRow key={index}>
      {[...Array(cellsNum)].map((cells, index) => (
        <TableCell component='th' scope='row' key={index}>
          <Skeleton animation='wave' variant='text' />
        </TableCell>
      ))}
    </TableRow>
  ))
}

export default TableRowsLoader
