import React from 'react'

import { Grid } from '@mui/material'

import { SalesRepresentativesTable } from '@components/admin-components'

const SalesRespresentative = () => {
  return (
    <Grid container>
      <Grid item xs={12}>
        <SalesRepresentativesTable />
      </Grid>
    </Grid>
  )
}

export default SalesRespresentative
