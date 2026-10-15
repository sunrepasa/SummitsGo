import { useEffect, useRef, useState } from 'react'
import Section from '../../mountain/detail/Section'
import { Textarea } from '../../ui/FormControls'

const MAX_LENGTH = 1000

function NoteEditor({ initial, saving, onCancel, onSave }) {
  const [draft, setDraft] = useState(initial)
  const ref = useRef(null)

  // editor bisa dibuka dari menu ⋮ saat catatan di luar layar
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    ref.current?.focus({ preventScroll: true })
  }, [])

  return (
    <div>
      <Textarea
        ref={ref}
        rows={5}
        maxLength={MAX_LENGTH}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        aria-label="Catatan pribadi"
        className="leading-relaxed"
      />
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <span className="text-[11px] text-mute">
          {draft.length}/{MAX_LENGTH}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-xl border border-line bg-paper px-4 py-2 text-[12.5px] font-semibold disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => onSave(draft.trim())}
            disabled={saving}
            className="rounded-xl bg-pine px-4 py-2 text-[12.5px] font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function NoteSection({ note, editing, saving, onEdit, onCancel, onSave }) {
  return (
    <Section>
      <div className="mb-2.5 flex items-center justify-between md:mb-3.5">
        <h2 className="font-heading text-[14.5px] font-bold md:text-[17px]">Catatan Pribadi</h2>
        {!editing && (
          <button
            type="button"
            onClick={onEdit}
            className="hidden text-[12.5px] font-semibold text-leaf-deep md:inline"
          >
            Edit Catatan
          </button>
        )}
      </div>

      {editing ? (
        <NoteEditor initial={note} saving={saving} onCancel={onCancel} onSave={onSave} />
      ) : note ? (
        <p className="whitespace-pre-line rounded-xl border border-line bg-paper p-3 text-[12.5px] leading-relaxed text-[#3A4640] md:rounded-none md:border-0 md:bg-transparent md:p-0 md:text-sm md:leading-[1.75]">
          {note}
        </p>
      ) : (
        <p className="text-xs text-mute md:text-[13px]">
          Belum ada catatan.{' '}
          <button type="button" onClick={onEdit} className="font-semibold text-leaf-deep">
            Tambahkan catatan
          </button>
        </p>
      )}
    </Section>
  )
}
