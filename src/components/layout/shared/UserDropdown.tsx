'use client'

// React Imports
import { useRef, useState } from 'react'
import type { MouseEvent } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

import type { AxiosResponse } from 'axios'

// MUI Imports
import { styled, useTheme } from '@mui/material/styles'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'

// Hook Imports
import { useMutation, useQuery } from '@tanstack/react-query'

import { toast } from 'react-toastify'

import { useSettings } from '@core/hooks/useSettings'

import { AuthService } from '@/services'
import { LoadingButton } from '@/components/admin-components'

// Styled component for badge content
const BadgeContentSpan = styled('span')({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)'
})

const UserDropdown = () => {
  // States
  const [open, setOpen] = useState(false)

  // Refs
  const anchorRef = useRef<HTMLDivElement>(null)

  // Hooks
  const router = useRouter()
  const theme = useTheme()

  const { settings } = useSettings()

  const handleDropdownOpen = () => {
    !open ? setOpen(true) : setOpen(false)
  }

  const handleDropdownClose = (event?: MouseEvent<HTMLLIElement> | (MouseEvent | TouchEvent), url?: string) => {
    if (url) {
      router.push(url)
    }

    if (anchorRef.current && anchorRef.current.contains(event?.target as HTMLElement)) {
      return
    }

    setOpen(false)
  }

  //logout mutation
  const mutation = useMutation({
    mutationFn: AuthService.onLogout,
    onSuccess: handleLogoutSuccess,
    onError: handleLogoutError
  })

  function handleLogoutSuccess(data: AxiosResponse<any, any>) {
    // Redirect to login page
    toast.success(data.data.message || 'Logout successfully')
    router.push('/login')
  }

  function handleLogoutError(error: any) {
    toast.error(error.message || 'Failed to logout, please try again.')
  }

  const handleUserLogout = () => {
    mutation.mutate()
  }

  //use Query
  const { data, error, isError } = useQuery({
    queryKey: ['userData'],
    queryFn: () => AuthService.getMeDetails(),
    enabled: Boolean(open)
  })

  if (isError) toast.error(error.message || 'Oops! something went wrong')

  return (
    <>
      <Badge
        ref={anchorRef}
        overlap='circular'
        badgeContent={<BadgeContentSpan onClick={handleDropdownOpen} />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className='mis-2'
      >
        <Avatar
          ref={anchorRef}
          alt='John Doe'
          src='/images/avatars/1.png'
          onClick={handleDropdownOpen}
          className='cursor-pointer bs-[38px] is-[38px]'
        />
      </Badge>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        className='min-is-[240px] !mbs-3 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
            }}
          >
            <Paper className={settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'}>
              <ClickAwayListener onClickAway={e => handleDropdownClose(e as MouseEvent | TouchEvent)}>
                <MenuList>
                  <div className='flex items-center plb-2 pli-6 gap-2' tabIndex={-1}>
                    <Avatar alt='John Doe' src={data?.photo || '/images/avatars/1.png'} />
                    <div className='flex items-start flex-col'>
                      <Typography className='font-medium' color='text.primary'>
                        {data?.name || 'John doe'}
                      </Typography>
                      <Typography variant='caption'>{data?.email || 'user@gmail.com'}</Typography>
                    </div>
                  </div>

                  <Divider className='mlb-1' />
                  {/* <MenuItem className='mli-2 gap-3' onClick={e => handleDropdownClose(e)}>
                    <i className='tabler-user text-[22px]' />
                    <Typography color='text.primary'>My Profile</Typography>
                  </MenuItem> */}
                  <MenuItem
                    className='mli-2 gap-3'
                    onClick={e => {
                      router.push('/admin/account-settings')
                      handleDropdownClose(e)
                    }}
                  >
                    <i className='tabler-settings text-[22px]' />
                    <Typography color='text.primary'>Settings</Typography>
                  </MenuItem>
                  {/* <MenuItem className='mli-2 gap-3' onClick={e => handleDropdownClose(e)}>
                    <i className='tabler-currency-dollar text-[22px]' />
                    <Typography color='text.primary'>Pricing</Typography>
                  </MenuItem>
                  <MenuItem className='mli-2 gap-3' onClick={e => handleDropdownClose(e)}>
                    <i className='tabler-help-circle text-[22px]' />
                    <Typography color='text.primary'>FAQ</Typography>
                  </MenuItem> */}
                  <div className='flex items-center plb-2 pli-3'>
                    <LoadingButton
                      label='Logout'
                      loading={mutation.isPending}
                      loaderColor={theme.palette.error.light}
                      color='error'
                      endIcon={<i className='tabler-logout' />}
                      sx={{ '& .MuiButton-endIcon': { marginInlineStart: 1.5 } }}
                      onClick={handleUserLogout}
                      size='small'
                    />
                  </div>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default UserDropdown
