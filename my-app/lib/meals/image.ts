const DEFAULT_MAX_LONG_EDGE = 1280
const DEFAULT_QUALITY = 0.72

/**
 * Downscale a meal photo to a 1280px JPEG before upload, matching the mobile app
 * (`compressImageForUpload`). Falls back to the original file if the browser cannot
 * decode or re-encode it, so a failed compression never blocks logging a meal.
 */
export async function compressImageForUpload(
  file: File,
  { maxLongEdge = DEFAULT_MAX_LONG_EDGE, quality = DEFAULT_QUALITY } = {},
): Promise<File> {
  if (typeof createImageBitmap !== 'function' || typeof document === 'undefined') return file
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const longEdge = Math.max(bitmap.width, bitmap.height)
    const scale = longEdge > maxLongEdge ? maxLongEdge / longEdge : 1
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) {
      bitmap.close()
      return file
    }
    context.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
    if (!blob) return file
    const baseName = file.name.replace(/\.[^.]+$/, '') || 'meal'
    return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' })
  } catch {
    return file
  }
}
