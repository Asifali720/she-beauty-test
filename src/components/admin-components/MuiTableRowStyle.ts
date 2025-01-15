'use client'
import { styled, TableRow } from '@mui/material'

export const StyledTableRow = styled(TableRow)(({}) => ({
  // hide last border
  '&:last-child td, &:last-child th': {}
}))
