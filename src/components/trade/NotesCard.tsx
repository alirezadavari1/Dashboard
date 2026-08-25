import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NotebookPen, Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { useLocalStorage } from '../../utils/useLocalStorage'
import { getFullTimestamp } from '../../utils/jalali'

interface Note {
  id: string
  text: string
  createdAt: string
  editedAt?: string
}

export default function NotesCard() {
  const [notes, setNotes] = useLocalStorage<Note[]>('trade-notes', [])
  const [draft, setDraft] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState('')

  const addNote = () => {
    const text = draft.trim()
    if (!text) return
    const note: Note = {
      id: crypto.randomUUID(),
      text,
      createdAt: getFullTimestamp(),
    }
    setNotes((prev) => [note, ...prev])
    setDraft('')
  }

  const startEdit = (note: Note) => {
    setEditingId(note.id)
    setEditDraft(note.text)
  }

  const saveEdit = (id: string) => {
    const text = editDraft.trim()
    if (!text) {
      setEditingId(null)
      return
    }
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, text, editedAt: getFullTimestamp() } : n))
    )
    setEditingId(null)
  }

  const removeNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden"
    >
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[var(--color-border-soft)]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-gold)]/10 text-[var(--color-gold)]">
          <NotebookPen size={16} />
        </div>
        <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)]">یادداشت</h2>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-start gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="اگر دوست داشتی چیزی درباره امروزت بنویس..."
            rows={2}
            className="min-w-0 flex-1 resize-none rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border)] focus:border-[var(--color-gold)]/50 px-3 py-2.5 text-[13px] text-[var(--color-text-primary)] outline-none transition-colors"
          />
          <button
            onClick={addNote}
            className="shrink-0 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-gold)] text-[#0b0e14] hover:brightness-110 transition-all"
            aria-label="افزودن یادداشت"
          >
            <Plus size={16} />
          </button>
        </div>

        {notes.length > 0 && (
          <div className="space-y-2 max-h-72 overflow-y-auto pe-1">
            <AnimatePresence initial={false}>
              {notes.map((note) => (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border-soft)] p-3.5"
                >
                  {editingId === note.id ? (
                    <div className="space-y-2">
                      <textarea
                        autoFocus
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        rows={2}
                        className="w-full resize-none rounded-lg bg-[var(--color-surface)] border border-[var(--color-gold)]/40 px-3 py-2 text-[13px] text-[var(--color-text-primary)] outline-none"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => saveEdit(note.id)}
                          className="flex items-center gap-1 rounded-md bg-[var(--color-up-soft)] text-[var(--color-up)] px-2.5 py-1 text-[11px] font-medium"
                        >
                          <Check size={12} /> ذخیره
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex items-center gap-1 rounded-md bg-[var(--color-down-soft)] text-[var(--color-down)] px-2.5 py-1 text-[11px] font-medium"
                        >
                          <X size={12} /> لغو
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-[13px] leading-relaxed text-[var(--color-text-primary)] whitespace-pre-wrap">
                        {note.text}
                      </p>
                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <p className="text-[10px] text-[var(--color-text-muted)] truncate">
                          {note.editedAt ? `ویرایش‌شده: ${note.editedAt}` : note.createdAt}
                        </p>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => startEdit(note)}
                            className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-gold)] hover:bg-[var(--color-surface-hover)] transition-colors"
                            aria-label="ویرایش"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => removeNote(note.id)}
                            className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-down)] hover:bg-[var(--color-down-soft)] transition-colors"
                            aria-label="حذف"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  )
}
