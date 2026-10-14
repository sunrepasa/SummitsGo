import Avatar from '../../ui/Avatar'

const palette = ['#1F3A2E', '#4E7A3B', '#5A7A8C', '#7A5A3E']

export default function MemberList({ checklist: c, busy, onKick, onCancelInvite }) {
  const isLeader = c.role === 'leader'

  return (
    <ul>
      {c.members.map((m, i) => (
        <li
          key={m.id}
          className="flex items-center gap-[11px] border-t border-line py-2.5 first:border-t-0 first:pt-0"
        >
          <Avatar name={m.name} size={34} style={{ background: palette[i % palette.length] }} />
          <p className="min-w-0 flex-1 text-[11.5px] text-mute">
            <b className="block truncate text-[13px] text-ink">
              {m.name}
              {m.id === c.viewerId && ' (kamu)'}
            </b>
            {m.role === 'leader' ? 'Ketua' : 'Anggota'}
          </p>
          {isLeader && m.role !== 'leader' && (
            <button
              type="button"
              disabled={busy}
              onClick={() => onKick(m)}
              className="text-[11.5px] font-semibold text-warn disabled:opacity-60"
            >
              Keluarkan
            </button>
          )}
        </li>
      ))}

      {c.pendingInvites.map((p) => (
        <li key={p.id} className="flex items-center gap-[11px] border-t border-line py-2.5">
          <Avatar name={p.name} size={34} style={{ background: '#B8C2B5' }} />
          <p className="min-w-0 flex-1 text-[11.5px] text-mute">
            <b className="block truncate text-[13px] text-ink">{p.name}</b>@{p.username} · Menunggu respons
          </p>
          {isLeader && (
            <button
              type="button"
              disabled={busy}
              onClick={() => onCancelInvite(p)}
              className="text-[11.5px] font-semibold text-warn disabled:opacity-60"
            >
              Batalkan
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}
