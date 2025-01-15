import React from 'react'

import { Grid } from '@mui/material'

import { InvoiceTable } from '@components/admin-components'

const InvoiceList = () => {
  return (
    <Grid container>
      <Grid item xs={12}>
        <InvoiceTable />
      </Grid>
    </Grid>
  )
}

export default InvoiceList
