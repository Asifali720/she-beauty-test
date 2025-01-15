import React from 'react'

import { Grid } from '@mui/material'

import { SalesRepresentativeTrashTable } from '@components/admin-components'

const DistributorTrashList = () => {
  return (
    <Grid container>
      <Grid item xs={12}>
        <SalesRepresentativeTrashTable />
      </Grid>
    </Grid>
  )
}

export default DistributorTrashList
