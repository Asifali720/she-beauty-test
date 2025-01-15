import React from 'react'

import { Grid } from '@mui/material'

import { ProductTrashTable } from '@components/admin-components'

const Product = () => {
  return (
    <Grid container>
      <Grid item xs={12}>
        <ProductTrashTable />
      </Grid>
    </Grid>
  )
}

export default Product
