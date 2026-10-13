import { useState } from 'react'
import { Star } from 'lucide-react'
import BottomSheet from '../../ui/BottomSheet'
import { Field, Textarea } from '../../ui/FormControls'
import { createReview } from '../../../api/review'
import { useAuth } from '../../../context/AuthContext'

const FORM_ID = 'review-form'
const MIN_LENGTH = 10
const MAX_LENGTH = 500

export default function ReviewModal({ mountain, onClose, onSaved }) {
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [showErrors, setShowErrors] = useState(false)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const trimmed = text.trim()
  const errors = {}
  if (!rating) errors.rating = 'Pilih jumlah bintang'
  if (trimmed.length < MIN_LENGTH) errors.text = `Tulis minimal ${MIN_LENGTH} karakter`

  const submit = async (e) => {
    e.preventDefault()
    setShowErrors(true)
    if (Object.keys(errors).length > 0) return

    setSaving(true)
    setSubmitError('')
    try {
      await createReview(mountain.id, { rating, text: trimmed, author: user.name })
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
        <p className="mb-3.5 text-xs text-mute">
          Bagikan pengalamanmu di <b className="text-ink">{mountain.name}</b>.
        </p>

        <Field label="Penilaian" error={showErrors ? errors.rating : undefined}>
          <div className="flex gap-1.5" role="radiogroup" aria-label="Penilaian">
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
                <Star size={28} fill={n <= rating ? 'currentColor' : 'none'} strokeWidth={n <= rating ? 0 : 1.6} />
              </button>
            ))}
          </div>
        </Field>

        <Field
          label="Ulasan"
          htmlFor="review-text"
          error={showErrors ? errors.text : undefined}
          hint={`${trimmed.length}/${MAX_LENGTH}`}
        >
          <Textarea
            id="review-text"
            rows={5}
            maxLength={MAX_LENGTH}
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-invalid={Boolean(showErrors && errors.text)}
            placeholder="Ceritakan kondisi jalur, cuaca, atau tips untuk pendaki lain"
          />
        </Field>

        {submitError && (
          <p className="mb-2 rounded-xl bg-warnbg px-3.5 py-2.5 text-xs font-semibold text-warn">{submitError}</p>
        )}
      </form>
    </BottomSheet>
  )
}
