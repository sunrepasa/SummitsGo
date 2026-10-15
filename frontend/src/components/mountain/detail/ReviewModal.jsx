import { useState } from 'react'
import { BadgeCheck, Star } from 'lucide-react'
import BottomSheet from '../../ui/BottomSheet'
import { Field, Textarea } from '../../ui/FormControls'
import { createReview } from '../../../api/review'
import { useAuth } from '../../../context/AuthContext'
import { REVIEW_TAGS } from '../../../utils/reviewTags'

const FORM_ID = 'review-form'
const MIN_LENGTH = 10
const MAX_LENGTH = 500

function VerifiedTag({ className = '' }) {
  return (
    <span
      className={`items-center gap-0.5 rounded-full bg-[#E7F0E1] px-2 py-0.5 text-[10px] font-semibold text-pine-deep md:px-2.5 md:text-[10.5px] ${className}`}
    >
      <BadgeCheck size={11} />
      Terverifikasi
    </span>
  )
}

// route/logbookId/verified hanya terisi bila ulasan ditulis dari entri logbook
export default function ReviewModal({ mountain, route, logbookId, verified = false, onClose, onSaved }) {
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [tags, setTags] = useState([])
  const [showErrors, setShowErrors] = useState(false)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const trimmed = text.trim()
  const errors = {}
  if (!rating) errors.rating = 'Pilih jumlah bintang'
  if (trimmed.length < MIN_LENGTH) errors.text = `Tulis minimal ${MIN_LENGTH} karakter`

  const toggleTag = (id) => setTags((list) => (list.includes(id) ? list.filter((t) => t !== id) : [...list, id]))

  const submit = async (e) => {
    e.preventDefault()
    setShowErrors(true)
    if (Object.keys(errors).length > 0) return

    setSaving(true)
    setSubmitError('')
    try {
      await createReview(mountain.id, {
        rating,
        text: trimmed,
        // urutan mengikuti daftar tag, bukan urutan klik
        tags: REVIEW_TAGS.filter((t) => tags.includes(t.id)).map((t) => t.id),
        route,
        logbookId,
        verified,
        author: user.name,
      })
      onSaved()
    } catch {
      setSubmitError('Gagal mengirim ulasan. Coba lagi.')
      setSaving(false)
    }
  }

  return (
    <BottomSheet
      open
      modal
      onClose={onClose}
      title="Tulis Ulasan"
      titleAddon={verified && <VerifiedTag className="inline-flex md:hidden" />}
      footer={
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="hidden flex-1 rounded-xl border border-line bg-paper py-3 text-[13px] font-semibold md:block"
          >
            Batal
          </button>
          <button
            type="submit"
            form={FORM_ID}
            disabled={saving}
            className="flex-1 rounded-xl bg-pine py-3 text-[13.5px] font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Mengirim...' : 'Kirim Ulasan'}
          </button>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={submit} noValidate>
        <p className="mb-4 flex items-center gap-2 text-[11.5px] text-mute md:text-[12.5px]">
          <span>
            {mountain.name}
            {route && ` · Via ${route}`}
          </span>
          {verified && <VerifiedTag className="hidden md:inline-flex" />}
        </p>

        <div className="mb-4">
          <div className="flex justify-center gap-2" role="radiogroup" aria-label="Penilaian">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} bintang`}
                onClick={() => setRating(n)}
                className="text-[#E0A93B]"
              >
                <Star
                  size={30}
                  fill={n <= rating ? 'currentColor' : 'none'}
                  strokeWidth={n <= rating ? 0 : 1.6}
                  className={n <= rating ? '' : 'text-line'}
                />
              </button>
            ))}
          </div>
          {showErrors && errors.rating && (
            <p className="mt-1.5 text-center text-[11px] font-semibold text-warn">{errors.rating}</p>
          )}
        </div>

        <Field
          label="Ceritakan pengalamanmu"
          htmlFor="review-text"
          error={showErrors ? errors.text : undefined}
          hint={`${trimmed.length}/${MAX_LENGTH}`}
        >
          <Textarea
            id="review-text"
            rows={4}
            maxLength={MAX_LENGTH}
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-invalid={Boolean(showErrors && errors.text)}
            placeholder="Ceritakan kondisi jalur, tips, atau pengalamanmu..."
          />
        </Field>

        <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Tag cepat">
          {REVIEW_TAGS.map((t) => {
            const on = tags.includes(t.id)
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggleTag(t.id)}
                className={`rounded-full border px-3 py-[7px] text-[11px] font-medium md:px-[13px] md:text-xs ${
                  on ? 'border-pine bg-pine text-white' : 'border-line text-ink'
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>

        {submitError && (
          <p className="mb-2 rounded-xl bg-warnbg px-3.5 py-2.5 text-xs font-semibold text-warn">{submitError}</p>
        )}
      </form>
    </BottomSheet>
  )
}
