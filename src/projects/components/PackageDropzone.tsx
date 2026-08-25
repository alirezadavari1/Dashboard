import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FileArchive, UploadCloud, X } from 'lucide-react'
import { formatFileSize, fileExtension } from '../utils'

interface PackageDropzoneProps {
  file: File | null
  existingFileName?: string
  existingFileSize?: number
  onSelect: (file: File) => void
  onClear: () => void
}

export default function PackageDropzone({
  file,
  existingFileName,
  existingFileSize,
  onSelect,
  onClear,
}: PackageDropzoneProps) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const displayName = file?.name ?? existingFileName
  const displaySize = file?.size ?? existingFileSize
  const hasFile = !!displayName

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onSelect(e.target.files[0])}
      />

      {hasFile ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-2xl border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/6 px-4 py-3"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-gold)]/15 text-[var(--color-gold)]">
            <FileArchive size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-[var(--color-text-primary)]">
              {displayName}
            </p>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              {fileExtension(displayName) && `${fileExtension(displayName)} · `}
              {formatFileSize(displaySize)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="shrink-0 rounded-lg px-2.5 py-1.5 text-[11.5px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            جایگزینی
          </button>
          <button
            type="button"
            onClick={onClear}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-down)] hover:bg-[var(--color-down-soft)] transition-colors"
            aria-label="حذف فایل"
          >
            <X size={13} />
          </button>
        </motion.div>
      ) : (
        <motion.div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            if (e.dataTransfer.files?.[0]) onSelect(e.dataTransfer.files[0])
          }}
          onClick={() => inputRef.current?.click()}
          className={`
            flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl
            border-2 border-dashed px-6 py-7 text-center transition-all duration-300
            ${dragging
              ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/8 scale-[1.01]'
              : 'border-[var(--color-border)] hover:border-[var(--color-gold)]/40 hover:bg-[var(--color-surface-hover)]'}
          `}
        >
          <motion.span
            animate={dragging ? { y: [-2, 2, -2] } : {}}
            transition={{ duration: 1, repeat: dragging ? Infinity : 0 }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-gold)]/12 text-[var(--color-gold)]"
          >
            <UploadCloud size={17} />
          </motion.span>
          <p className="text-[12.5px] font-medium text-[var(--color-text-primary)]">
            فایل پروژه رو بکش و رها کن یا کلیک کن
          </p>
          <p className="text-[11px] text-[var(--color-text-muted)] max-w-[280px]">
            هر نوع فایلی — پیشنهاد می‌کنیم اگه چند فایل داری، همه رو zip کنی و همون رو آپلود کنی. حجم زیاد هم مشکلی نیست.
          </p>
        </motion.div>
      )}
    </div>
  )
}
