import React from 'react'

import { Grid } from '@mui/material'

import { ProductTable } from '@components/admin-components'

const ProductList = () => {
  return (
    <Grid container>
      <Grid item xs={12}>
        <ProductTable />
      </Grid>
    </Grid>
  )
}

export default ProductList
