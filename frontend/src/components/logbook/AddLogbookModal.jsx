import { useState } from 'react'
import { Info } from 'lucide-react'
import BottomSheet from '../ui/BottomSheet'
import PhotoPicker from '../ui/PhotoPicker'
import { Field, Input, Select, Textarea } from '../ui/FormControls'
import { getMountainRoutes, getMountains } from '../../api/mountain'
import { createLogbook } from '../../api/logbook'
import { useAsync } from '../../hooks/useAsync'
import { todayIso } from '../../utils/date'

const FORM_ID = 'add-logbook-form'
const EMPTY = { mountainId: '', route: '', startDate: '', days: '', note: '', photo: null }

function validate(f) {
  const errors = {}
  if (!f.mountainId) errors.mountainId = 'Pilih gunung terlebih dahulu'
  if (!f.route) errors.route = 'Pilih jalur pendakian'
  if (!f.startDate) errors.startDate = 'Tanggal wajib diisi'
  else if (f.startDate > todayIso()) errors.startDate = 'Tanggal tidak boleh di masa depan'
  if (f.days !== '') {
    const n = Number(f.days)
    if (!Number.isInteger(n) || n < 1 || n > 30) errors.days = 'Isi 1 sampai 30 hari'
  }
  return errors
}

export default function AddLogbookModal({ onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY)
  const [showErrors, setShowErrors] = useState(false)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const mountains = useAsync(() => getMountains({ sort: 'name' }), [])

  // hasil dibungkus bersama mountainId-nya supaya daftar jalur gunung sebelumnya
  // tidak sempat tampil selama jalur gunung yang baru dimuat
  const routes = useAsync(
    () =>
      form.mountainId
        ? getMountainRoutes(form.mountainId).then((list) => ({ mountainId: form.mountainId, list }))
        : Promise.resolve({ mountainId: '', list: [] }),
    [form.mountainId],
  )
  const routesReady = routes.data?.mountainId === form.mountainId
  const routeOptions = routesReady ? routes.data.list : []
  const routesLoading = Boolean(form.mountainId) && !routesReady && !routes.error

  const errors = showErrors ? validate(form) : {}
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const setMountain = (e) => setForm((f) => ({ ...f, mountainId: e.target.value, route: '' }))

  const submit = async (e) => {
    e.preventDefault()
    setShowErrors(true)
    if (Object.keys(validate(form)).length > 0) return

    setSaving(true)
    setSubmitError('')
    try {
      await createLogbook({
        mountainId: form.mountainId,
        route: form.route,
        startDate: form.startDate,
        days: form.days === '' ? null : Number(form.days),
        note: form.note.trim(),
        photo: form.photo,
      })
      onSaved()
    } catch {
      setSubmitError('Gagal menyimpan. Coba lagi.')
      setSaving(false)
    }
  }

  return (
    <BottomSheet
      open
      modal
      onClose={onClose}
      title="Tambah Manual"
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
            {saving ? 'Menyimpan...' : 'Simpan ke Logbook'}
          </button>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={submit} noValidate>
        <div className="md:grid md:grid-cols-2 md:gap-3">
          <Field
            label="Gunung"
            htmlFor="lb-mountain"
            error={mountains.error ? 'Gagal memuat daftar gunung' : errors.mountainId}
          >
            <Select
              id="lb-mountain"
              value={form.mountainId}
              onChange={setMountain}
              aria-invalid={Boolean(errors.mountainId)}
            >
              <option value="">{mountains.loading ? 'Memuat gunung...' : 'Pilih gunung...'}</option>
              {mountains.data?.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Jalur"
            htmlFor="lb-route"
            error={routes.error ? 'Gagal memuat daftar jalur' : errors.route}
          >
            <Select
              id="lb-route"
              value={form.route}
              onChange={set('route')}
              disabled={!form.mountainId || routesLoading}
              aria-invalid={Boolean(errors.route)}
            >
              <option value="">
                {!form.mountainId ? 'Pilih gunung dulu' : routesLoading ? 'Memuat jalur...' : 'Pilih jalur...'}
              </option>
              {routeOptions.map((r) => (
                <option key={r} value={r}>
                  Via {r}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-2.5 md:gap-3">
          <Field label="Tanggal" htmlFor="lb-date" error={errors.startDate}>
            <Input
              id="lb-date"
              type="date"
              max={todayIso()}
              value={form.startDate}
              onChange={set('startDate')}
              aria-invalid={Boolean(errors.startDate)}
            />
          </Field>
          <Field label="Durasi (hari, opsional)" htmlFor="lb-days" error={errors.days}>
            <Input
              id="lb-days"
              type="number"
              inputMode="numeric"
              min={1}
              max={30}
              placeholder="2"
              value={form.days}
              onChange={set('days')}
              aria-invalid={Boolean(errors.days)}
            />
          </Field>
        </div>

        <Field label="Foto (opsional)">
          <PhotoPicker onChange={(photo) => setForm((f) => ({ ...f, photo }))} />
        </Field>

        <Field label="Catatan (opsional)" htmlFor="lb-note">
          <Textarea
            id="lb-note"
            placeholder="Ceritakan pendakianmu..."
            maxLength={1000}
            value={form.note}
            onChange={set('note')}
          />
        </Field>

        <p className="mb-1 flex gap-2 rounded-[10px] bg-stone px-3 py-2.5 text-[11px] leading-normal text-mute">
          <Info size={14} className="mt-px shrink-0" />
          Entri ini tidak mendapat badge "Terverifikasi" karena diisi manual, bukan dari deteksi lokasi otomatis.
        </p>

        {submitError && <p className="mt-2 text-xs font-semibold text-warn">{submitError}</p>}
      </form>
    </BottomSheet>
  )
}