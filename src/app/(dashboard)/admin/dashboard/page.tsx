// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import CardHeader from '@mui/material/CardHeader'

const Dashboard = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Dashboard is in progress and something big is coming your way. Please wait...'></CardHeader>
        </Card>
      </Grid>
    </Grid>
  )
}

export default Dashboard
