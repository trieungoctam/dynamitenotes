import { useState, useCallback } from 'react'

interface UploadState {
  uploadId: string
  file: File
  bucket: 'photos' | 'posts'
  uploadedParts: number[]
  totalParts: number
}

interface UseResumableUploadReturn {
  state: UploadState | null
  saveState: (uploadState: UploadState) => void
  loadState: (uploadId: string) => UploadState | null
  clearState: (uploadId: string) => void
}

export function useResumableUpload(): UseResumableUploadReturn {
  const [state, setState] = useState<UploadState | null>(null)

  // Save to localStorage (simplified - in production use IndexedDB)
  const saveState = useCallback((uploadState: UploadState) => {
    const key = `upload-${uploadState.uploadId}`
    try {
      localStorage.setItem(key, JSON.stringify(uploadState))
      setState(uploadState)
    } catch (err) {
      console.error('Failed to save upload state:', err)
    }
  }, [])

  // Load from localStorage
  const loadState = useCallback((uploadId: string): UploadState | null => {
    const key = `upload-${uploadId}`
    try {
      const data = localStorage.getItem(key)
      if (!data) return null

      const uploadState = JSON.parse(data) as UploadState
      setState(uploadState)
      return uploadState
    } catch (err) {
      console.error('Failed to load upload state:', err)
      return null
    }
  }, [])

  // Clear state
  const clearState = useCallback((uploadId: string) => {
    const key = `upload-${uploadId}`
    try {
      localStorage.removeItem(key)
      setState(null)
    } catch (err) {
      console.error('Failed to clear upload state:', err)
    }
  }, [])

  return { state, saveState, loadState, clearState }
}
