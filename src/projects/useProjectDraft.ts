import { useCallback, useState } from 'react'
import { parseTags } from './utils'
import { ICON_PRESETS } from './palette'
import type { ProjectDraftInput, ProjectItem } from './types'

export function useProjectDraft(existing?: ProjectItem) {
  const [name, setName] = useState(existing?.name ?? '')
  const [shortDescription, setShortDescription] = useState(existing?.shortDescription ?? '')
  const [longDescription, setLongDescription] = useState(existing?.longDescription ?? '')
  const [tagsInput, setTagsInput] = useState(existing?.tags?.join('، ') ?? '')
  const [version, setVersion] = useState(existing?.version ?? '')
  const [iconKey, setIconKey] = useState(existing?.iconKey ?? ICON_PRESETS[0].key)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [packageFile, setPackageFile] = useState<File | null>(null)

  const reset = useCallback(() => {
    setName('')
    setShortDescription('')
    setLongDescription('')
    setTagsInput('')
    setVersion('')
    setIconKey(ICON_PRESETS[0].key)
    setCoverFile(null)
    setPackageFile(null)
  }, [])

  const isValid = name.trim().length > 0 && shortDescription.trim().length > 0

  const toDraftInput = useCallback((): ProjectDraftInput => ({
    name,
    shortDescription,
    longDescription,
    tags: parseTags(tagsInput),
    version,
    iconKey,
    coverFile,
    packageFile,
  }), [name, shortDescription, longDescription, tagsInput, version, iconKey, coverFile, packageFile])

  return {
    name, setName,
    shortDescription, setShortDescription,
    longDescription, setLongDescription,
    tagsInput, setTagsInput,
    version, setVersion,
    iconKey, setIconKey,
    coverFile, setCoverFile,
    packageFile, setPackageFile,
    isValid,
    reset,
    toDraftInput,
  }
}

export type ProjectDraft = ReturnType<typeof useProjectDraft>
