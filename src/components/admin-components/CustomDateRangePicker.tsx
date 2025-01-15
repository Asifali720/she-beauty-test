'use client'
import React, { useEffect, useState } from 'react'

import { Box, Typography } from '@mui/material'

import { toast } from 'react-toastify'

import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import CustomTextField from '@/@core/components/mui/TextField'

type Props = {
  handleDateRange: (startDate: Date | null, endDate: Date | null) => void
  isColumnPicker?: boolean
  isReset?: boolean
}

const CustomDateRangePicker = ({ handleDateRange, isColumnPicker, isReset }: Props) => {
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  const handleDateChange = (start: Date | null, end: Date | null) => {
    if (!start) setEndDate(null)

    if (start && end) handleDateRange(start, end)
    else handleDateRange(null, null)
  }

  const handleStartDate = (date: Date) => {
    setStartDate(date)

    if (endDate && date > endDate) {
      setEndDate(date)
      handleDateChange(date, date)
    } else {
      handleDateChange(date, endDate)
    }
  }

  const handleEndDate = (date: Date) => {
    if (date >= startDate!) {
      setEndDate(date)
      handleDateChange(startDate, date)
    } else {
      toast.error('Please select a later date.')
      setEndDate(null)
    }
  }

  useEffect(() => {
    if (!isReset) {
      setStartDate(null)
      setEndDate(null)
    }
  }, [isReset])

  return (
    <Box
      display='flex'
      flexDirection={isColumnPicker ? 'column' : 'row'}
      alignItems={isColumnPicker ? 'normal' : 'center'}
      gap={2}
      pt={{ xs: 2, sm: 0 }}
    >
      <AppReactDatepicker
        placeholderText='DD-MM-YYYY'
        dateFormat={'dd-MM-yyyy'}
        selected={startDate}
        maxDate={endDate}
        autoComplete='off'
        onChange={handleStartDate}
        customInput={
          <CustomTextField fullWidth label='Start Date' sx={{ pb: 4.5 }} autoComplete='off' required={isColumnPicker} />
        }
      />

      {!isColumnPicker && <Typography>-</Typography>}

      <AppReactDatepicker
        placeholderText='DD-MM-YYYY'
        dateFormat={'dd-MM-yyyy'}
        selected={endDate}
        onChange={handleEndDate}
        minDate={startDate}
        disabled={!startDate}
        autoComplete='off'
        customInput={
          <CustomTextField fullWidth label='End Date' sx={{ pb: 4.5 }} autoComplete='off' required={isColumnPicker} />
        }
      />
    </Box>
  )
}

export default CustomDateRangePicker
