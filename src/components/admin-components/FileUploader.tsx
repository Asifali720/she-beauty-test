'use client'

// MUI Imports
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'

// Third-party Imports
import type { DropEvent, FileRejection } from 'react-dropzone'
import { useDropzone } from 'react-dropzone'
import { FormHelperText, useTheme } from '@mui/material'

type FileProp = {
  name: string
  type: string
}
type Props = {
  helperText?: string
  onDrop?: (<T extends File>(acceptedFiles: T[], fileRejections: FileRejection[], event: DropEvent) => void) | undefined
  files?: File[]
  isProfile?: boolean
  disabled?: boolean
  title?: string
  required?: boolean
}

const FileUploaderSingle = ({
  helperText,
  onDrop,
  files,
  isProfile = false,
  disabled = false,
  title,
  required
}: Props) => {
  // Hooks
  const theme = useTheme()

  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    onDrop: onDrop,
    disabled: disabled
  })

  const img =
    typeof files === 'string' ? (
      <img
        src={files}
        alt='image'
        width={200}
        height={200}
        className={`single-file-image rounded-lg self-center shadow-lg object-cover ${!disabled && 'cursor-pointer'}`}
      />
    ) : (
      files?.map((file: FileProp) => (
        <img
          key={file.name}
          alt={file.name}
          width={200}
          height={200}
          className={`single-file-image rounded-lg self-center shadow-lg object-cover ${!disabled && 'cursor-pointer'}`}
          src={URL.createObjectURL(file as any)}
        />
      ))
    )

  const profileImg =
    typeof files === 'string' ? (
      <img
        src={files}
        alt='image'
        width={150}
        height={150}
        className={`single-file-image rounded-full self-center ${!disabled && 'cursor-pointer'}object-cover`}
      />
    ) : (
      files?.map((file: FileProp) => (
        <img
          key={file.name}
          alt={file.name}
          width={150}
          height={150}
          className={`single-file-image rounded-full self-center ${!disabled && 'cursor-pointer'}object-cover`}
          src={URL.createObjectURL(file as any)}
        />
      ))
    )

  return (
    <Box
      {...getRootProps({
        className: `dropzone ${!files?.length && 'border-[2px] border-dotted hover:border-primary cursor-pointer px-5'} `
      })}
      {...(files?.length && {
        sx: { display: 'flex', justifyContent: 'center', alignItems: 'center' }
      })}
    >
      <input {...getInputProps()} />

      {files?.length ? (
        !isProfile ? (
          <div className='group relative'>
            {img}
            <Box className='group-hover:absolute group-hover:top-[40%] group-hover:left-[40%] group-hover:backdrop-blur-[2px] transition duration-200 ease-in-out transform group-hover:scale-110 '>
              {!disabled && (
                <Avatar
                  variant='rounded'
                  className='group-hover:opacity-100 opacity-0 transition duration-200 ease-in-out hidden group-hover:flex'
                >
                  <i className='tabler-upload cursor-pointer' />
                </Avatar>
              )}
            </Box>
          </div>
        ) : (
          <div className='group relative'>
            {profileImg}
            <Box className='group-hover:absolute group-hover:top-[40%] group-hover:left-[40%] group-hover:backdrop-blur-[2px] transition duration-200 ease-in-out transform group-hover:scale-110 '>
              {!disabled && (
                <Avatar
                  variant='rounded'
                  className='group-hover:opacity-100 opacity-0 transition duration-200 ease-in-out hidden group-hover:flex'
                  sx={{ width: '30px', height: '30px' }}
                >
                  <i className='tabler-upload cursor-pointer' />
                </Avatar>
              )}
            </Box>
          </div>
        )
      ) : (
        <div className='flex items-center flex-col justify-center'>
          {!disabled && (
            <Avatar variant='rounded' className='bs-12 is-12 mbe-4 mt-2 cursor-pointer'>
              <i className='tabler-upload' />
            </Avatar>
          )}
          <Typography variant='h6' className='mbe-2.5'>
            {title || 'Drop files here or click to upload.'}{' '}
            {required && (
              <span
                style={{
                  color: theme.palette.error.light
                }}
              >
                *
              </span>
            )}
          </Typography>

          <FormHelperText
            sx={{
              color: theme.palette.error.main,
              fontSize: theme.typography.body2.fontSize
            }}
          >
            {helperText && helperText}
          </FormHelperText>
        </div>
      )}
    </Box>
  )
}

export default FileUploaderSingle
