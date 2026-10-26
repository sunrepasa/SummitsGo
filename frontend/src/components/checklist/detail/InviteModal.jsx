import { useState } from 'react'
import { Copy, Link2, X } from 'lucide-react'
import BottomSheet from '../../ui/BottomSheet'
import Avatar from '../../ui/Avatar'
import { Input, PrefixInput } from '../../ui/FormControls'
import { createInviteLink, inviteByUsername, searchUsers } from '../../../api/checklist'
import { useToast } from '../../../context/ToastContext'
import { useAsync } from '../../../hooks/useAsync'
import { useDebounce } from '../../../hooks/useDebounce'
import { normalizeUsername } from '../../../utils/username'

const MIN_QUERY = 2
const stateLabel = { member: 'Sudah anggota', invited: 'Sudah diundang' }
const inviteErrors = {
  ALREADY_MEMBER: 'Pengguna ini sudah menjadi anggota.',
  ALREADY_INVITED: 'Pengguna ini sudah diundang.',
  USER_NOT_FOUND: 'Pengguna tidak ditemukan.',
}

function UserSuggestions({ query, debounced, state, onPick }) {
  if (query.length < MIN_QUERY) {
    return <p className="mt-2 text-[11px] text-mute">Ketik minimal {MIN_QUERY} karakter username atau nama.</p>
  }
  // hasil milik query lain dianggap usang; useAsync tidak mengosongkan data saat parameter berganti
  const ready = state.data?.q === debounced && query === debounced
  if (state.error) return <p className="mt-2 text-[11px] text-warn">Gagal mencari pengguna. Coba lagi.</p>
  if (!ready) return <p className="mt-2 text-[11px] text-mute">Mencari…</p>
  if (state.data.list.length === 0) {
    return <p className="mt-2 text-[11px] text-mute">Tidak ada pengguna yang cocok dengan &quot;{query}&quot;.</p>
  }

  return (
    <ul className="mt-2 overflow-hidden rounded-xl border border-line">
      {state.data.list.map((u) => {
        const blocked = Boolean(u.state)
        return (
          <li key={u.id} className="border-t border-line first:border-t-0">
            <button
              type="button"
              disabled={blocked}
              onClick={() => onPick(u)}
              className="flex w-full items-center gap-2.5 bg-paper px-3 py-2.5 text-left enabled:hover:bg-stone disabled:opacity-60"
            >
              <Avatar name={u.name} size={30} />
              <span className="min-w-0 flex-1 text-[11.5px] text-mute">
                <b className="block truncate text-[12.5px] text-ink">{u.name}</b>@{u.username}
              </span>
              {blocked && <span className="shrink-0 text-[10.5px] font-semibold text-mute">{stateLabel[u.state]}</span>}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export default function InviteModal({ checklistId, onClose, onInvited }) {
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const debounced = useDebounce(query, 300)
  const search = useAsync(
    () => (debounced.length >= MIN_QUERY ? searchUsers(debounced, checklistId) : Promise.resolve([])).then((list) => ({ q: debounced, list })),
    [debounced, checklistId],
  )
  const link = useAsync(() => createInviteLink(checklistId), [checklistId])

  const send = async () => {
    setSending(true)
    setError('')
    try {
      await inviteByUsername(checklistId, selected.username)
      toast.success(`Undangan dikirim ke ${selected.name}`)
      setSelected(null)
      setQuery('')
      onInvited()
    } catch (err) {
      setError(inviteErrors[err.code] ?? 'Gagal mengirim undangan. Coba lagi.')
    } finally {
      setSending(false)
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link.data)
      toast.success('Tautan disalin')
    } catch {
      toast.error('Gagal menyalin. Salin manual dari kolom tautan.')
    }
  }

  return (
    <BottomSheet open modal onClose={onClose} title="Undang Anggota">
      <div className="pb-5">
        <h3 className="mb-1 font-heading text-[13px] font-bold md:text-sm">Undang lewat username</h3>
        <p className="mb-2.5 text-[11.5px] leading-normal text-mute">
          Pengguna yang diundang menerima undangan di halaman Checklist-nya dan bisa langsung menerima atau
          mengabaikan.
        </p>

        {selected ? (
          <div className="flex items-center gap-2.5 rounded-xl border border-pine bg-[#EFF4EB] px-3 py-2.5">
            <Avatar name={selected.name} size={30} />
            <span className="min-w-0 flex-1 text-[11.5px] text-mute">
              <b className="block truncate text-[12.5px] text-ink">{selected.name}</b>@{selected.username}
            </span>
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Ganti pengguna yang dipilih"
              className="flex size-7 items-center justify-center rounded-full text-mute hover:bg-paper"
            >
              <X size={15} />
            </button>
          </div>
        ) : (
          <>
            <PrefixInput
              prefix="@"
              value={query}
              onChange={(e) => setQuery(normalizeUsername(e.target.value.replace(/^@/, '')))}
              placeholder="username"
              aria-label="Cari username"
              autoComplete="off"
            />
            <UserSuggestions query={query} debounced={debounced} state={search} onPick={setSelected} />
          </>
        )}

        {selected && (
          <button
            type="button"
            onClick={send}
            disabled={sending}
            className="mt-3 w-full rounded-xl bg-pine py-3 text-[13.5px] font-semibold text-white disabled:opacity-60"
          >
            {sending ? 'Mengirim...' : 'Kirim Undangan'}
          </button>
        )}
        {error && <p className="mt-2 rounded-xl bg-warnbg px-3.5 py-2.5 text-xs font-semibold text-warn">{error}</p>}

        <div className="my-5 flex items-center gap-3 text-[11px] text-mute">
          <span className="h-px flex-1 bg-line" />
          atau
          <span className="h-px flex-1 bg-line" />
        </div>

        <h3 className="mb-1 flex items-center gap-1.5 font-heading text-[13px] font-bold md:text-sm">
          <Link2 size={14} />
          Bagikan tautan
        </h3>
        <p className="mb-2.5 text-[11.5px] leading-normal text-mute">
          Cocok untuk teman yang belum punya akun. Bagikan lewat WhatsApp atau aplikasi lain.
        </p>

        {link.error ? (
          <p className="rounded-xl bg-warnbg px-3.5 py-2.5 text-xs text-warn">
            Gagal membuat tautan.{' '}
            <button type="button" onClick={link.reload} className="font-semibold underline">
              Coba lagi
            </button>
          </p>
        ) : link.loading ? (
          <div className="h-[84px] animate-pulse rounded-xl bg-line" aria-busy="true" aria-label="Membuat tautan" />
        ) : (
          <div className="rounded-xl border border-line bg-stone p-3">
            <Input readOnly value={link.data} aria-label="Tautan undangan" onFocus={(e) => e.target.select()} />
            <button
              type="button"
              onClick={copy}
              className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-line bg-paper py-2.5 text-[12.5px] font-semibold"
            >
              <Copy size={14} />
              Salin Tautan
            </button>
          </div>
        )}
      </div>
    </BottomSheet>
  )
}

