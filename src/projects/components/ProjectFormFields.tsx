import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { ICON_PRESETS, paletteFor } from '../palette'
import CoverPicker from './CoverPicker'
import PackageDropzone from './PackageDropzone'
import type { ProjectDraft } from '../useProjectDraft'
import type { ProjectItem } from '../types'

interface ProjectFormFieldsProps {
  draft: ProjectDraft
  existing?: ProjectItem
  existingCoverUrl?: string
}

export default function ProjectFormFields({ draft, existing, existingCoverUrl }: ProjectFormFieldsProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-[var(--color-text-secondary)]">
            نام پروژه *
          </label>
          <input
            value={draft.name}
            onChange={(e) => draft.setName(e.target.value)}
            placeholder="مثلا: افزونه مدیریت تسک"
            className="w-full rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border)] focus:border-[var(--color-gold)]/50 px-3.5 py-2.5 text-[13.5px] text-[var(--color-text-primary)] outline-none transition-colors"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-[var(--color-text-secondary)]">
            نسخه (اختیاری)
          </label>
          <input
            value={draft.version}
            onChange={(e) => draft.setVersion(e.target.value)}
            placeholder="مثلا: v1.0"
            className="w-full rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border)] focus:border-[var(--color-gold)]/50 px-3.5 py-2.5 text-[13.5px] text-[var(--color-text-primary)] outline-none transition-colors font-mono"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-[12px] font-medium text-[var(--color-text-secondary)]">
          توضیح کوتاه *
          <span className="text-[var(--color-text-muted)] font-normal"> — همین متن روی کارت نمایش داده می‌شه</span>
        </label>
        <input
          value={draft.shortDescription}
          onChange={(e) => draft.setShortDescription(e.target.value)}
          placeholder="یک جمله کوتاه و جذاب درباره پروژه"
          maxLength={140}
          className="w-full rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border)] focus:border-[var(--color-gold)]/50 px-3.5 py-2.5 text-[13.5px] text-[var(--color-text-primary)] outline-none transition-colors"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-[12px] font-medium text-[var(--color-text-secondary)]">
          توضیح کامل
          <span className="text-[var(--color-text-muted)] font-normal"> — وقتی روی پروژه کلیک بشه نمایش داده می‌شه</span>
        </label>
        <textarea
          value={draft.longDescription}
          onChange={(e) => draft.setLongDescription(e.target.value)}
          placeholder="همه‌چیز رو درباره این پروژه توضیح بده: چیه، چیکار می‌کنه، چطور ساختیش، چرا بهش افتخار می‌کنی..."
          rows={5}
          className="w-full resize-none rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border)] focus:border-[var(--color-gold)]/50 px-3.5 py-2.5 text-[13.5px] leading-relaxed text-[var(--color-text-primary)] outline-none transition-colors"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-[12px] font-medium text-[var(--color-text-secondary)]">
          برچسب‌ها (اختیاری)
          <span className="text-[var(--color-text-muted)] font-normal"> — با ویرگول جدا کن</span>
        </label>
        <input
          value={draft.tagsInput}
          onChange={(e) => draft.setTagsInput(e.target.value)}
          placeholder="مثلا: React، Chrome Extension، اتوماسیون"
          className="w-full rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border)] focus:border-[var(--color-gold)]/50 px-3.5 py-2.5 text-[13.5px] text-[var(--color-text-primary)] outline-none transition-colors"
        />
      </div>

      <div>
        <label className="mb-2 block text-[12px] font-medium text-[var(--color-text-secondary)]">
          دسته‌بندی
        </label>
        <div className="grid grid-cols-7 gap-2">
          {ICON_PRESETS.map((preset, idx) => {
            const Icon = preset.icon
            const active = draft.iconKey === preset.key
            const palette = paletteFor(idx)
            return (
              <button
                key={preset.key}
                type="button"
                title={preset.label}
                onClick={() => draft.setIconKey(preset.key)}
                className={`relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${palette.grad} transition-transform hover:scale-105`}
              >
                <Icon size={15} className="text-white/90" strokeWidth={1.8} />
                {active && (
                  <motion.div
                    layoutId="project-icon-check"
                    className="absolute -top-1 -end-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-gold)] text-[#0b0e14]"
                  >
                    <Check size={10} strokeWidth={3} />
                  </motion.div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-[var(--color-text-secondary)]">
            عکس پروژه
          </label>
          <CoverPicker
            file={draft.coverFile}
            existingPreviewUrl={existingCoverUrl}
            onSelect={draft.setCoverFile}
            onClear={() => draft.setCoverFile(null)}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-[var(--color-text-secondary)]">
            فایل قابل استفاده
            <span className="text-[var(--color-text-muted)] font-normal"> — همونی که با دکمه «استفاده» دانلود می‌شه</span>
          </label>
          <PackageDropzone
            file={draft.packageFile}
            existingFileName={existing?.fileName}
            existingFileSize={existing?.fileSize}
            onSelect={draft.setPackageFile}
            onClear={() => draft.setPackageFile(null)}
          />
        </div>
      </div>
    </div>
  )
}
