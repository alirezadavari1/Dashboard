import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { UploadCloud, Loader2 } from 'lucide-react'

interface UploadDropzoneProps {
  onFiles: (files: FileList | File[]) => Promise<void>
}

export default function UploadDropzone({ onFiles }: UploadDropzoneProps) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleFiles = async (files: FileList | File[]) => {
    setUploading(true)
    try {
      await onFiles(files)
    } finally {
      setUploading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files)
      }}
      onClick={() => inputRef.current?.click()}
      className={`
        flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl
        border-2 border-dashed px-6 py-8 text-center transition-all duration-300
        ${dragging
          ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/8 scale-[1.01]'
          : 'border-[var(--color-border)] hover:border-[var(--color-gold)]/40 hover:bg-[var(--color-surface-hover)]'}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      <motion.span
        animate={dragging ? { y: [-2, 2, -2] } : {}}
        transition={{ duration: 1, repeat: dragging ? Infinity : 0 }}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-gold)]/12 text-[var(--color-gold)]"
      >
        {uploading ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
      </motion.span>

      <p className="text-[13px] font-medium text-[var(--color-text-primary)]">
        {uploading ? 'در حال افزودن آهنگ‌ها...' : 'فایل آهنگ رو بکش و رها کن یا کلیک کن'}
      </p>
      <p className="text-[11px] text-[var(--color-text-muted)]">
        MP3، WAV، OGG و سایر فرمت‌های صوتی — چند فایل هم‌زمان مجاز است
      </p>
    </motion.div>
  )
}
