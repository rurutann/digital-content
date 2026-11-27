import { useRef } from 'react'

type UploadPanelProps = {
  onFilesSelected: (files: File[]) => void
  disabled?: boolean
}

export default function UploadPanel({ onFilesSelected, disabled = false }: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return <>
    <input
      ref={inputRef}
      className="visually-hidden"
      type="file"
      accept="image/jpeg,image/png,image/heic,image/heif"
      multiple
      onChange={(event) => {
        const files = Array.from(event.currentTarget.files ?? [])
        if (files.length) onFilesSelected(files)
        event.currentTarget.value = ''
      }}
    />
    <button className="button button--primary" type="button" disabled={disabled} onClick={() => inputRef.current?.click()}>
      写真を追加
    </button>
  </>
}
