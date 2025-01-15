import React from 'react'

import { Grid } from '@mui/material'

import { ClaimTable } from '@components/admin-components'

const ClaimList = () => {
  return (
    <Grid container>
      <Grid item xs={12}>
        <ClaimTable />
      </Grid>
    </Grid>
  )
}

export default ClaimList
