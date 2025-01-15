import React from 'react'

import { Grid } from '@mui/material'

import { DistributorTrashTable } from '@components/admin-components'

const DistributorTrashList = () => {
  return (
    <Grid container>
      <Grid item xs={12}>
        <DistributorTrashTable />
      </Grid>
    </Grid>
  )
}

export default DistributorTrashList
