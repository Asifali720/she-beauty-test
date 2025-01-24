export const imageConvertBase64 = async (image: any) => {
  const response = await fetch(image.src)
  const blob = await response.blob()

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result) // Base64 string
    reader.onerror = () => reject(new Error('Error converting to Base64'))
    reader.readAsDataURL(blob) // Converts blob to Base64
  })
}
