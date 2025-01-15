import React from 'react'

import { Grid } from '@mui/material'

import { DistributorTable } from '@components/admin-components'

const DistributorList = () => {
  return (
    <Grid container>
      <Grid item xs={12}>
        <DistributorTable />
      </Grid>
    </Grid>
  )
}

export default DistributorList
