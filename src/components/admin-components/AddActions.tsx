'use client'

// Next Imports
import type { BaseSyntheticEvent } from 'react'

import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

type Props = {
  onSubmit: (e?: BaseSyntheticEvent<object, any, any> | undefined) => Promise<void>
}

const AddActions = ({ onSubmit }: Props) => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardContent className='flex flex-col gap-4'>
            <Button fullWidth component={Link} color='secondary' variant='tonal' className='capitalize' href='#'>
              Preview
            </Button>
            <Button fullWidth variant='contained' className='capitalize' onClick={onSubmit}>
              Save
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default AddActions
