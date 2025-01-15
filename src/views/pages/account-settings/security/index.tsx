// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import ChangePasswordCard from './ChangePasswordCard'

const Security = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ChangePasswordCard />
      </Grid>
    </Grid>
  )
}

export default Security
