import React from 'react'

import { Grid } from '@mui/material'

import { BillingTable } from '@components/admin-components'

const BillList = () => {
  return (
    <Grid container>
      <Grid item xs={12}>
        <BillingTable />
      </Grid>
    </Grid>
  )
}

export default BillList
