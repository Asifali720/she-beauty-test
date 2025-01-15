'use client'
import { styled, TableCell, tableCellClasses } from '@mui/material'

export const StyledTableCell = styled(TableCell)(({}) => ({
  // styling for head
  [`&.${tableCellClasses.head}`]: {
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',
    fontWeight: '500',
    letterSpacing: '1px',
    fontSize: '0.8125rem'
  },

  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    color: 'text.primary',
    whiteSpace: 'nowrap'
  }
}))
