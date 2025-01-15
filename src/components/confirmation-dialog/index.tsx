'use client'

// React Imports
import { Fragment } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// Third-party Imports
// import classnames from 'classnames'

type ConfirmationType = 'delete-account' | 'unsubscribe' | 'suspend-account' | 'delete-it' | 'restore-it' | 'return-it'

type ConfirmationDialogProps = {
  open: boolean
  setOpen: (open: boolean) => void

  // secondDialog: boolean
  // setSecondDialog: (open: boolean) => void
  type: ConfirmationType
  confrimation?: () => void
}

const ConfirmationDialog = ({
  open,
  setOpen,
  type,
  confrimation

  // secondDialog,
  // setSecondDialog
}: ConfirmationDialogProps) => {
  // States
  // const [userInput, setUserInput] = useState(false)

  // Vars
  const Wrapper = type === 'suspend-account' ? 'div' : Fragment

  // const handleSecondDialogClose = () => {
  //   setSecondDialog(false)
  //   setOpen(false)
  // }

  const handleConfirmation = (value: boolean) => {
    // setUserInput(value)

    if (confrimation && value) confrimation()
    else {
      setOpen(false)

      // setSecondDialog(true)
    }
  }

  return (
    <>
      <Dialog fullWidth maxWidth='xs' open={open} onClose={() => setOpen(false)}>
        <DialogContent className='flex items-center flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
          <i className='tabler-alert-circle text-[88px] mbe-6 text-warning' />
          <Wrapper
            {...(type === 'suspend-account' && {
              className: 'flex flex-col items-center gap-5'
            })}
          >
            <Typography variant='h5'>
              {type === 'delete-account' && 'Are you sure you want to deactivate your account?'}
              {type === 'delete-it' && 'Are you sure you want to delete it?'}
              {type === 'restore-it' && 'Are you sure you want to restore it?'}
              {type === 'return-it' && 'Are you sure you want to return it?'}
              {type === 'unsubscribe' && 'Are you sure to cancel your subscription?'}
              {type === 'suspend-account' && 'Are you sure?'}
            </Typography>
            {type === 'suspend-account' && (
              <Typography color='text.primary'>You won&#39;t be able to revert user!</Typography>
            )}
          </Wrapper>
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button variant='contained' onClick={() => handleConfirmation(true)}>
            {type === 'suspend-account' ? 'Yes, Suspend User!' : 'Yes'}
          </Button>
          <Button
            variant='tonal'
            color='error'
            onClick={() => {
              handleConfirmation(false)
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      {/* <Dialog fullWidth maxWidth='xs' open={secondDialog} onClose={handleSecondDialogClose}>
        <DialogContent className='flex items-center flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
          <i
            className={classnames('text-[88px] mbe-5 sm:mbe-8', {
              'tabler-circle-check': userInput,
              'text-success': userInput,
              'tabler-circle-x': !userInput,
              'text-error': !userInput
            })}
          />
          <Typography variant='h4' className='mbe-5'>
            {userInput
              ? `${type === 'delete-account' ? 'Deactivated' : type === 'unsubscribe' ? 'Unsubscribed' : type === 'delete-it' ? 'Deleted' : type === 'restore-it' ? 'Restored' : type === 'return-it' ? 'Order Returned' : 'Suspended!'}`
              : 'Cancelled'}
          </Typography>
          <Typography color='text.primary'>
            {userInput ? (
              <>
                {type === 'delete-it' && 'It has been deleted successfully.'}
                {type === 'restore-it' && 'It has been restored successfully.'}
                {type === 'return-it' && 'It has been returned successfully.'}
                {type === 'delete-account' && 'Your account has been deactivated successfully.'}
                {type === 'unsubscribe' && 'Your subscription cancelled successfully.'}
                {type === 'suspend-account' && 'User has been suspended.'}
              </>
            ) : (
              <>
                {type === 'delete-it' && 'Deletion Cancelled!'}
                {type === 'restore-it' && 'Restoration Cancelled!'}
                {type === 'return-it' && 'Returned Cancelled!'}
                {type === 'delete-account' && 'Account Deactivation Cancelled!'}
                {type === 'unsubscribe' && 'Unsubscription Cancelled!!'}
                {type === 'suspend-account' && 'Cancelled Suspension :)'}
              </>
            )}
          </Typography>
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button variant='contained' color='success' onClick={handleSecondDialogClose}>
            Ok
          </Button>
        </DialogActions>
      </Dialog> */}
    </>
  )
}

export default ConfirmationDialog
