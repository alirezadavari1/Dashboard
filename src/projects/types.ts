// Data shapes for the Projects module.
// The cover image and the actual downloadable package (zip / plugin file /
// whatever the user built) live in IndexedDB as Blobs — see db.ts. Only
// lightweight metadata is kept here / in React state.

export interface ProjectItem {
  id: string
  name: string
  shortDescription: string
  longDescription: string
  tags: string[]
  version?: string
  iconKey: string
  paletteIndex: number

  hasCover: boolean

  hasFile: boolean
  fileName?: string
  fileSize?: number // bytes
  fileMime?: string

  useCount: number
  createdAt: string
  updatedAt: string
}

// Shape used by the add/edit form before it becomes a persisted ProjectItem.
export interface ProjectDraftInput {
  name: string
  shortDescription: string
  longDescription: string
  tags: string[]
  version?: string
  iconKey: string
  coverFile?: File | null
  packageFile?: File | null
}
