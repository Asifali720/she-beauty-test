// ** MUI Imports
import Grid from '@mui/material/Grid'

import { RawItemsTable } from '@components/admin-components'

const RawItemsList = () => {
  return (
    <Grid container>
      <Grid item xs={12}>
        <RawItemsTable />
      </Grid>
    </Grid>
  )
}

export default RawItemsList
