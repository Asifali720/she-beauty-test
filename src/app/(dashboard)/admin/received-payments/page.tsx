import React from 'react'

import { Grid } from '@mui/material'

import { ReceivedPaymentTable } from '@components/admin-components'

const PaymentList = () => {
  return (
    <Grid container>
      <Grid item xs={12}>
        <ReceivedPaymentTable />
      </Grid>
    </Grid>
  )
}

export default PaymentList
