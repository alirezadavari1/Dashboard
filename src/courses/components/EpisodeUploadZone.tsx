import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { UploadCloud, Loader2, Film } from 'lucide-react'
import { toPersianDigits } from '../utils'

interface EpisodeUploadZoneProps {
  onFiles: (files: FileList | File[]) => Promise<void>
}

export default function EpisodeUploadZone({ onFiles }: EpisodeUploadZoneProps) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files)
    setPendingCount(arr.length)
    setUploading(true)
    try {
      await onFiles(arr)
    } finally {
      setUploading(false)
      setPendingCount(0)
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
      onClick={() => !uploading && inputRef.current?.click()}
      className={`
        flex flex-col items-center justify-center gap-2 rounded-2xl
        border-2 border-dashed px-6 py-8 text-center transition-all duration-300
        ${uploading ? 'cursor-wait' : 'cursor-pointer'}
        ${dragging
          ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/8 scale-[1.01]'
          : 'border-[var(--color-border)] hover:border-[var(--color-gold)]/40 hover:bg-[var(--color-surface-hover)]'}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      <motion.span
        animate={dragging ? { y: [-2, 2, -2] } : uploading ? { rotate: 360 } : {}}
        transition={
          uploading
            ? { duration: 1.4, repeat: Infinity, ease: 'linear' }
            : { duration: 1, repeat: dragging ? Infinity : 0 }
        }
        className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-gold)]/12 text-[var(--color-gold)]"
      >
        {uploading ? <Loader2 size={18} /> : <UploadCloud size={18} />}
      </motion.span>

      <p className="text-[13px] font-medium text-[var(--color-text-primary)]">
        {uploading
          ? `در حال افزودن ${toPersianDigits(pendingCount)} قسمت... کمی صبر کن`
          : 'فایل‌های ویدیویی رو بکش و رها کن یا کلیک کن'}
      </p>
      <p className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)]">
        <Film size={11} />
        همه‌ی قسمت‌ها رو یه‌جا انتخاب کن — تا ۴۰ تا هم مشکلی نیست، به ترتیب اسم مرتب می‌شن
      </p>
    </motion.div>
  )
}
