import Pica from 'pica'

// Worker message handler
self.addEventListener('message', async (e: MessageEvent) => {
  const { type, payload } = e.data

  try {
    switch (type) {
      case 'GENERATE_SIZES':
        const { file, imageId } = payload

        // Load image
        const image = await loadImage(file)
        self.postMessage({ type: 'PROGRESS', imageId, percent: 20 })

        // Strip EXIF
        const canvas = new OffscreenCanvas(image.width, image.height)
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(image, 0, 0)

        const original = await canvas.convertToBlob({ type: 'image/webp', quality: 0.95 })
        self.postMessage({ type: 'PROGRESS', imageId, percent: 40 })

        // Generate sizes
        const pica = Pica()
        const sizes = { thumbnail: 200, medium: 800, large: 1920 }
        const results: any = { original }

        let completed = 0
        await Promise.all(
          Object.entries(sizes).map(async ([name, size]) => {
            const scale = size / Math.max(image.width, image.height)
            const resized = new OffscreenCanvas(
              Math.round(image.width * scale),
              Math.round(image.height * scale)
            )

            await pica.resize(image, resized, { quality: 3 })

            results[name] = await resized.convertToBlob({ type: 'image/webp', quality: 0.85 })

            completed++
            self.postMessage({
              type: 'PROGRESS',
              imageId,
              percent: 40 + (completed / 3) * 60
            })
          })
        )

        self.postMessage({ type: 'COMPLETE', imageId, results })
        break

      default:
        throw new Error(`Unknown message type: ${type}`)
    }
  } catch (error: any) {
    self.postMessage({ type: 'ERROR', imageId: payload.imageId, error: error.message })
  }
})

async function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export {}
