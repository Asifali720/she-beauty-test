import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
// eslint-disable-next-line import/named
import { v4 } from 'uuid'

import { storage } from '@/configs/firebaseConfig'

type ImageType = string | File

export const uploadImageFile = async (imageFile: ImageType) => {
  if (!imageFile) return

  // If it's already a URL, return it directly
  if (typeof imageFile === 'string' && imageFile.includes('https://firebasestorage.googleapis.com/')) {
    return imageFile
  }

  // Otherwise, handle the file upload
  const fileExtension = (imageFile as File).name.split('.')
  const name = v4()
  const storageRef = ref(storage, `image/${name}.${fileExtension[1]}`)

  try {
    const snapshot = await uploadBytes(storageRef, imageFile as File)
    const url = await getDownloadURL(snapshot.ref)

    return url
  } catch (err: any) {
    throw new Error(err.message)
  }
}
