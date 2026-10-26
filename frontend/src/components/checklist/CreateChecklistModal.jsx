import { useState } from 'react'
import BottomSheet from '../ui/BottomSheet'
import { Field, Input, Select } from '../ui/FormControls'
import { getMountainRoutes, getMountains } from '../../api/mountain'
import { createChecklist, getChecklistTemplates } from '../../api/checklist'
import { useAuth } from '../../context/AuthContext'
import { useAsync } from '../../hooks/useAsync'
import { todayIso } from '../../utils/date'

const FORM_ID = 'create-checklist-form'
const EMPTY = { mountainId: '', route: '', plannedDate: '', source: 'empty', templateId: '' }

const sources = [
  { value: 'empty', title: 'Mulai Kosong', description: 'Susun daftar barang dari nol' },
  { value: 'mine', title: 'Dari Template Saya', description: 'Pakai template yang pernah disimpan' },
  { value: 'system', title: 'Template Default Sistem', description: 'Rekomendasi barang umum dari SummitsGo' },
]

function validate(f, templateId, templateCount) {
  const errors = {}
  if (!f.mountainId) errors.mountainId = 'Pilih gunung terlebih dahulu'
  if (!f.route) errors.route = 'Pilih jalur pendakian'
  if (f.plannedDate && f.plannedDate < todayIso()) {
    errors.plannedDate = 'Tanggal rencana tidak boleh di masa lalu'
  }
  if (f.source !== 'empty' && !templateId) {
    errors.template = templateCount === 0 ? 'Belum ada template, pilih opsi lain' : 'Pilih template terlebih dahulu'
  }
  return errors
}

function SourceOption({ checked, onChange, title, description, children }) {
  return (
    <>
      <label
        className={`mb-[9px] flex cursor-pointer items-center gap-[11px] rounded-[13px] border-[1.5px] px-[13px] py-3 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-leaf md:gap-3 md:px-3.5 ${
          checked ? 'border-pine bg-[#EFF4EB]' : 'border-line'
        }`}
      >
        <input
          type="radio"
          name="checklist-source"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <span
          className={`flex size-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
            checked ? 'border-pine' : 'border-line'
          }`}
        >
          {checked && <span className="size-[9px] rounded-full bg-pine" />}
        </span>
        <span>
          <span className="block text-[12.5px] font-semibold md:text-[13px]">{title}</span>
          <span className="mt-px block text-[10.5px] text-mute md:text-[11px]">{description}</span>
        </span>
      </label>
      {checked && children}
    </>
  )
}

function TemplateChips({ loading, failed, items, selectedId, onSelect, emptyText, error }) {
  let content
  if (failed) {
    content = <p className="text-[11px] font-semibold text-warn">Gagal memuat template</p>
  } else if (loading) {
    content = <p className="text-[11px] text-mute">Memuat template...</p>
  } else if (items.length === 0) {
    content = <p className="text-[11px] leading-normal text-mute">{emptyText}</p>
  } else {
    content = items.map((t) => (
      <button
        key={t.id}
        type="button"
        aria-pressed={t.id === selectedId}
        onClick={() => onSelect(t.id)}
        className={`mb-1.5 mr-1.5 rounded-full border px-3 py-[7px] text-[11px] font-medium md:px-[13px] md:text-[11.5px] ${
          t.id === selectedId ? 'border-pine bg-pine text-white' : 'border-line bg-paper text-ink'
        }`}
      >
        {t.name}
      </button>
    ))
  }

  return (
    <div className="mb-3 ml-[29px] md:ml-[30px]">
      {content}
      {error && <p className="mt-0.5 text-[11px] font-semibold text-warn">{error}</p>}
    </div>
  )
}

export default function CreateChecklistModal({ onClose, onSaved, initialMountainId = '' }) {
  const { user } = useAuth()
  const [form, setForm] = useState(() => ({ ...EMPTY, mountainId: initialMountainId }))
  const [showErrors, setShowErrors] = useState(false)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const mountains = useAsync(() => getMountains({ sort: 'name' }), [])
  const templates = useAsync(getChecklistTemplates, [])

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

  // template terpilih diturunkan dari daftar yang sedang aktif, jadi pindah opsi
  // otomatis jatuh ke template pertama tanpa efek tambahan
  const templateList = form.source === 'empty' ? null : templates.data?.[form.source]
  const selectedId = templateList?.some((t) => t.id === form.templateId)
    ? form.templateId
    : (templateList?.[0]?.id ?? '')

  const errors = showErrors ? validate(form, selectedId, templateList?.length) : {}
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const setMountain = (e) => setForm((f) => ({ ...f, mountainId: e.target.value, route: '' }))

  const submit = async (e) => {
    e.preventDefault()
    setShowErrors(true)
    if (Object.keys(validate(form, selectedId, templateList?.length)).length > 0) return

    setSaving(true)
    setSubmitError('')
    try {
      await createChecklist({
        mountainId: form.mountainId,
        route: form.route,
        plannedDate: form.plannedDate,
        templateId: form.source === 'empty' ? '' : selectedId,
        leaderName: user.name,
      })
      onSaved()
    } catch {
      setSubmitError('Gagal membuat checklist. Coba lagi.')
      setSaving(false)
    }
  }

  return (
    <BottomSheet
      open
      modal
      onClose={onClose}
      title="Buat Checklist Baru"
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
            {saving ? 'Membuat...' : 'Buat Checklist'}
          </button>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={submit} noValidate>
        <div className="md:grid md:grid-cols-2 md:gap-3">
          <Field
            label="Gunung"
            htmlFor="cl-mountain"
            error={mountains.error ? 'Gagal memuat daftar gunung' : errors.mountainId}
          >
            <Select
              id="cl-mountain"
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
            htmlFor="cl-route"
            error={routes.error ? 'Gagal memuat daftar jalur' : errors.route}
          >
            <Select
              id="cl-route"
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

        <Field label="Tanggal Rencana (opsional)" htmlFor="cl-date" error={errors.plannedDate}>
          <Input
            id="cl-date"
            type="date"
            min={todayIso()}
            value={form.plannedDate}
            onChange={set('plannedDate')}
            aria-invalid={Boolean(errors.plannedDate)}
          />
        </Field>

        <p className="mb-2.5 mt-[18px] text-xs font-semibold md:mt-1.5">Mulai dari mana?</p>

        {sources.map((s) => (
          <SourceOption
            key={s.value}
            checked={form.source === s.value}
            onChange={() => setForm((f) => ({ ...f, source: s.value }))}
            title={s.title}
            description={s.description}
          >
            {s.value !== 'empty' && (
              <TemplateChips
                loading={templates.loading}
                failed={Boolean(templates.error)}
                items={templateList ?? []}
                selectedId={selectedId}
                onSelect={(id) => setForm((f) => ({ ...f, templateId: id }))}
                emptyText={
                  s.value === 'mine'
                    ? 'Kamu belum punya template. Simpan checklist sebagai template dari halaman detail checklist.'
                    : 'Belum ada template default.'
                }
                error={errors.template}
              />
            )}
          </SourceOption>
        ))}

        {submitError && <p className="mb-2 text-xs font-semibold text-warn">{submitError}</p>}
      </form>
    </BottomSheet>
  )
}