import React from 'react'

import { Grid } from '@mui/material'

import { AdjustmentTable } from '@components/admin-components'

const AdjustmentList = () => {
  return (
    <Grid container>
      <Grid item xs={12}>
        <AdjustmentTable />
      </Grid>
    </Grid>
  )
}

export default AdjustmentList
