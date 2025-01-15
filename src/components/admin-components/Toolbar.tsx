// ** React Imports
import type { ChangeEventHandler } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'

// ** Custom Component Import
import CustomTextField from '@core/components/mui/TextField'

// ** Icon Imports
import ButtonsWithIconAndLabel from './ButtonsWithIconAndLabel'
import CustomDateRangePicker from './CustomDateRangePicker'

interface Props {
  value?: string
  clearSearch?: () => void
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> | undefined
  placeholder?: string
  buttonLabel?: string
  onClick?: () => void
  isButton?: boolean
  handleDateRange: (startDate: Date | null, endDate: Date | null) => void
  isDateRangePicker?: boolean
  isSearchField?: boolean
}

const Toolbar = (props: Props) => {
  return (
    <Box
      sx={{
        gap: 2,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: theme => theme.spacing(2, 5, 4, 5)
      }}
    >
      <Box display='flex' flexDirection={{ xs: 'column', sm: 'row' }} gap={5} alignItems='center'>
        {props?.isSearchField && (
          <CustomTextField
            value={props.value}
            placeholder={props.placeholder}
            onChange={props.onChange}
            sx={{
              width: {
                xs: 1,
                sm: 'auto'
              },

              '& .MuiInputBase-root > svg': {
                mr: 2
              }
            }}
          />
        )}

        {props.isDateRangePicker && (
          <CustomDateRangePicker
            handleDateRange={(startDate: Date | null, endDate: Date | null) =>
              props.handleDateRange(startDate, endDate)
            }
          />
        )}
      </Box>

      {props?.isButton && (
        <Box sx={{ gap: 4, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
          <ButtonsWithIconAndLabel label={props.buttonLabel!} icon='tabler:plus' onClick={props.onClick} />
        </Box>
      )}
    </Box>
  )
}

export default Toolbar
