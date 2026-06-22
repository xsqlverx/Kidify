import { useState, useEffect } from "react"
import {
  getDailyMessage,
  getMessageForOffset,
  GALLERY_IMAGES,
  THANK_YOU_CONTENT,
  type DailyMessage,
  type GalleryImage,
  type ThankYouContent,
} from "./mock-data"

function getDateFromOffset(offset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().slice(0, 10)
}

export function useDailyMessage(dayOffset: number = 0): DailyMessage {
  const [apiMessage, setApiMessage] = useState<DailyMessage | null>(null)
  const date = getDateFromOffset(dayOffset)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/messages/${date}`)
      .then((r) => (r.ok ? r.json() : Promise.resolve(null)))
      .then((data) => {
        if (!cancelled && data && data.title) {
          setApiMessage(data)
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [date])

  const fallback = dayOffset === 0 ? getDailyMessage() : getMessageForOffset(dayOffset)
  return apiMessage ?? fallback
}

export function getMessagesForRange(fromOffset: number, toOffset: number): DailyMessage[] {
  const fallback: DailyMessage[] = []
  for (let i = fromOffset; i <= toOffset; i++) {
    fallback.push(i === 0 ? getDailyMessage() : getMessageForOffset(i))
  }
  return fallback
}

export function useGalleryImages(): GalleryImage[] {
  const [apiImages, setApiImages] = useState<GalleryImage[] | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/gallery")
      .then((r) => (r.ok ? r.json() : Promise.resolve(null)))
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setApiImages(data)
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  return apiImages ?? GALLERY_IMAGES
}

export function useThankYou(): ThankYouContent {
  const [apiThankYou, setApiThankYou] = useState<ThankYouContent | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/thankyou")
      .then((r) => (r.ok ? r.json() : Promise.resolve(null)))
      .then((data) => {
        if (!cancelled && data && data.intro) {
          setApiThankYou(data)
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  return apiThankYou ?? THANK_YOU_CONTENT
}
