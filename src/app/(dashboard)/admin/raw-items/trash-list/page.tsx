// ** MUI Imports
import Grid from '@mui/material/Grid'

import { RawItemsTrashTable } from '@components/admin-components'

const TrashRawItemsList = () => {
  return (
    <Grid container>
      <Grid item xs={12}>
        <RawItemsTrashTable />
      </Grid>
    </Grid>
  )
}

export default TrashRawItemsList
