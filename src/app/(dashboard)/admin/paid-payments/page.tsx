import React from 'react'

import { Grid } from '@mui/material'

import { PaidPaymentTable } from '@components/admin-components'

const PaymentList = () => {
  return (
    <Grid container>
      <Grid item xs={12}>
        <PaidPaymentTable />
      </Grid>
    </Grid>
  )
}

export default PaymentList
