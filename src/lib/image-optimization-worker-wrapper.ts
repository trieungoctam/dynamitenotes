import { ImageSizes } from './image-optimization'

let worker: Worker | null = null

export function generateImageSizesInWorker(
  file: File,
  imageId: string,
  onProgress: (percent: number) => void
): Promise<ImageSizes> {
  return new Promise((resolve, reject) => {
    // Create worker if needed
    if (!worker) {
      worker = new Worker(
        new URL('./image-optimization.worker.ts', import.meta.url),
        { type: 'module' }
      )
    }

    // Setup message handler
    const handler = (e: MessageEvent) => {
      const { type, imageId: id, percent, results, error } = e.data

      if (id !== imageId) return

      switch (type) {
        case 'PROGRESS':
          onProgress(percent)
          break
        case 'COMPLETE':
          worker!.removeEventListener('message', handler)
          resolve(results)
          break
        case 'ERROR':
          worker!.removeEventListener('message', handler)
          reject(new Error(error))
          break
      }
    }

    worker.addEventListener('message', handler)

    // Start processing
    worker.postMessage({
      type: 'GENERATE_SIZES',
      payload: { file, imageId }
    })
  })
}

export function terminateWorker() {
  worker?.terminate()
  worker = null
}
