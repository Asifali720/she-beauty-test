import React from 'react'

import { Grid } from '@mui/material'

import { OrderDispatchTable } from '@/components/admin-components'

const OrderDispatchList = () => {
  return (
    <Grid container>
      <Grid item xs={12}>
        <OrderDispatchTable />
      </Grid>
    </Grid>
  )
}

export default OrderDispatchList
