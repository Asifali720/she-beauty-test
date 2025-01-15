// ** React Imports
'use client'
import type { Ref, ReactElement } from 'react'
import React, { forwardRef } from 'react'

import Image from 'next/image'

import type { FadeProps } from '@mui/material/Fade'
import Fade from '@mui/material/Fade'
import { Card, Dialog } from '@mui/material'

import Icon from '@core/components/icon'

import CustomCloseButton from './CustomCloseButton'

interface Props {
  handleImageViewClose?: React.MouseEventHandler<HTMLButtonElement> | undefined
  openImageViewBox: boolean
  src: string
}

const Transition = forwardRef(function Transition(
  props: FadeProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Fade ref={ref} {...props} />
})

const ImageViewDialogBox = ({ src, handleImageViewClose, openImageViewBox }: Props) => {
  return (
    <Card>
      <Dialog
        fullWidth
        open={openImageViewBox}
        onClose={handleImageViewClose}
        TransitionComponent={Transition}
        maxWidth='sm'
        scroll='body'
        onBackdropClick={handleImageViewClose}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible', width: '600px', height: '600px' } }}
      >
        <CustomCloseButton onClick={handleImageViewClose} className='z-10'>
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </CustomCloseButton>

        <Image
          src={src}
          unoptimized
          alt={'Image'}
          fill
          sizes='100vw'
          loading='eager'
          className='object-cover overflow-hidden rounded-lg opacity-0 transition-opacity duration-[1s]'
          onLoad={image => image?.currentTarget?.classList?.remove('opacity-0')}
        />
      </Dialog>
    </Card>
  )
}

export default ImageViewDialogBox
