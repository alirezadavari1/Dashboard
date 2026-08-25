import { useEffect, useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'

interface CoverPickerProps {
  file: File | null
  existingPreviewUrl?: string
  onSelect: (file: File) => void
  onClear: () => void
}

export default function CoverPicker({ file, existingPreviewUrl, onSelect, onClear }: CoverPickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [localUrl, setLocalUrl] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!file) {
      setLocalUrl(undefined)
      return
    }
    const url = URL.createObjectURL(file)
    setLocalUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const previewUrl = localUrl ?? existingPreviewUrl

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onSelect(e.target.files[0])}
      />
      <div
        onClick={() => inputRef.current?.click()}
        className="group relative flex h-28 w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-gold)]/40 bg-[var(--color-surface-hover)] transition-colors duration-300"
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="پیش‌نمایش کاور" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="rounded-lg bg-white/15 px-3 py-1.5 text-[11.5px] font-medium text-white backdrop-blur-sm">
                تغییر عکس
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onClear()
              }}
              className="absolute top-2 end-2 flex h-6 w-6 items-center justify-center rounded-lg bg-black/40 text-white/90 hover:bg-black/60 backdrop-blur-sm"
              aria-label="حذف عکس"
            >
              <X size={12} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-[var(--color-text-muted)] group-hover:text-[var(--color-gold)] transition-colors">
            <ImagePlus size={20} />
            <span className="text-[11.5px] font-medium">افزودن عکس پروژه</span>
          </div>
        )}
      </div>
    </div>
  )
}
