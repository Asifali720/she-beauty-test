import React from 'react'

import { Grid } from '@mui/material'

import { VendorTrashTable } from '@components/admin-components'

const VendorTrashList = () => {
  return (
    <Grid container>
      <Grid item xs={12}>
        <VendorTrashTable />
      </Grid>
    </Grid>
  )
}

export default VendorTrashList
