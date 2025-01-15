// ** MUI Imports
import Grid from '@mui/material/Grid'

import { IngredientsTable } from '@components/admin-components'

const RawItemsList = () => {
  return (
    <Grid container>
      <Grid item xs={12}>
        <IngredientsTable />
      </Grid>
    </Grid>
  )
}

export default RawItemsList
