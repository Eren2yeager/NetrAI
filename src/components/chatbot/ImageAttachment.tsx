'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — ImageAttachment
// Hidden file input + Cloudinary upload for the citizen chatbot.
//
// Flow:
//   1. User clicks the paperclip icon in ChatInput
//   2. Hidden <input type="file"> opens the OS file picker
//   3. On selection → show local object-URL preview immediately (instant)
//   4. Upload to Cloudinary in background using unsigned upload
//   5. On success  → call onUploaded(cloudinaryUrl, fileName)
//   6. On failure  → call onError(message)
//
// The parent (CitizenChatbot) shows the preview right away from the object-URL
// and replaces it with the Cloudinary URL once the upload settles.
//
// Accepted: image/* — JPEG, PNG, WEBP, HEIC.
// Max size: 5 MB client-side guard before upload.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useCallback } from 'react'
import { Paperclip } from 'lucide-react'

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_BYTES       = 5 * 1024 * 1024   // 5 MB
const CLOUD_NAME      = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET   = 'netraai_unsigned' // create this in Cloudinary dashboard:
                                            // Settings → Upload → Upload presets → Add preset
                                            //   Signing mode: Unsigned
                                            //   Folder: netraai/complaints

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AttachmentResult {
  previewUrl:    string   // object-URL — available immediately, revoked after use
  cloudinaryUrl: string   // permanent Cloudinary URL — available after upload
  fileName:      string
  base64:        string   // base64 string for Groq vision — set when upload resolves
  mimeType:      string
}

interface ImageAttachmentProps {
  onPreview:    (previewUrl: string, fileName: string) => void
  onUploaded:   (result: AttachmentResult) => void
  onError:      (message: string) => void
  disabled?:    boolean
}

// ── Cloudinary unsigned upload ────────────────────────────────────────────────

async function uploadToCloudinary(file: File): Promise<string> {
  if (!CLOUD_NAME) throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set')

  const formData = new FormData()
  formData.append('file',           file)
  formData.append('upload_preset',  UPLOAD_PRESET)
  formData.append('folder',         'netraai/complaints')

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )

  if (!res.ok) throw new Error(`Cloudinary upload failed: ${res.status}`)

  const data = await res.json()
  return data.secure_url as string
}

// ── File → base64 ─────────────────────────────────────────────────────────────

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ImageAttachment({
  onPreview,
  onUploaded,
  onError,
  disabled,
}: ImageAttachmentProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = useCallback(() => {
    if (!disabled) inputRef.current?.click()
  }, [disabled])

  const handleChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset so the same file can be re-selected after clearing
    e.target.value = ''

    // Client-side size guard
    if (file.size > MAX_BYTES) {
      onError('Image must be under 5 MB.')
      return
    }

    const previewUrl = URL.createObjectURL(file)
    onPreview(previewUrl, file.name)

    // Upload + base64 in parallel
    try {
      const [cloudinaryUrl, base64] = await Promise.all([
        uploadToCloudinary(file),
        fileToBase64(file),
      ])

      // Release the object-URL now that we have the permanent URL
      URL.revokeObjectURL(previewUrl)

      onUploaded({
        previewUrl,     // kept for reference even though revoked
        cloudinaryUrl,
        fileName:  file.name,
        base64,
        mimeType:  file.type,
      })
    } catch (err) {
      console.error('[ImageAttachment] upload error:', err)
      onError('Image upload failed. Please try again.')
    }
  }, [onPreview, onUploaded, onError])

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleChange}
      />

      {/* Paperclip trigger button — rendered by parent ChatInput */}
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-label="Attach an image"
        className="text-ink-400 hover:text-ink-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed p-1"
      >
        <Paperclip className="h-5 w-5" aria-hidden="true" />
      </button>
    </>
  )
}
