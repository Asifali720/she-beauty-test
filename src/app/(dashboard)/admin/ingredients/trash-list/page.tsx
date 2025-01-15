// ** MUI Imports
import Grid from '@mui/material/Grid'

import { IngredientsTrashTable } from '@components/admin-components'

const TrashRawItemsList = () => {
  return (
    <Grid container>
      <Grid item xs={12}>
        <IngredientsTrashTable />
      </Grid>
    </Grid>
  )
}

export default TrashRawItemsList
