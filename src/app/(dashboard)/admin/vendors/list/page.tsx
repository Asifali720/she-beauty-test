import React from 'react'

import { Grid } from '@mui/material'

import { VendorTable } from '@components/admin-components'

const VendorList = () => {
  return (
    <Grid container>
      <Grid item xs={12}>
        <VendorTable />
      </Grid>
    </Grid>
  )
}

export default VendorList
