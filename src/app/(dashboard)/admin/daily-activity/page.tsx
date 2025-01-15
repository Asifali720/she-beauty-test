import React from 'react'

import { Grid } from '@mui/material'

import { DailyActivityTable } from '@components/admin-components'

const DailyActivity = () => {
  return (
    <Grid container>
      <Grid item xs={12}>
        <DailyActivityTable />
      </Grid>
    </Grid>
  )
}

export default DailyActivity
