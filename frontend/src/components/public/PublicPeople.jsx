import { ChevronRight, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import Avatar from '../ui/Avatar'
import Section from '../mountain/detail/Section'

const palette = ['#1F3A2E', '#4E7A3B', '#5A7A8C', '#7A5A3E']
const card = 'hidden rounded-[18px] border border-line bg-paper p-[22px] md:block'

function PrivateTag() {
  return (
    <span className="flex shrink-0 items-center gap-1 text-[11px] text-mute">
      <Lock size={11} />
      Profil privat
    </span>
  )
}

// variant "mobile": blok bergaris di kolom utama; "desktop": kartu di sidebar
export function OwnerSection({ owner, variant }) {
  const canView = owner.isProfilePublic && owner.username

  const identity = (
    <>
      <Avatar name={owner.name} size={variant === 'mobile' ? 42 : 46} />
      <div className="min-w-0 flex-1">
        <b className="block truncate text-[13.5px]">{owner.name}</b>
        {owner.username && <span className="text-[11.5px] text-mute">@{owner.username}</span>}
      </div>
    </>
  )

  if (variant === 'mobile') {
    return (
      <Section title="Pendaki" className="md:hidden">
        <div className="flex items-center gap-3">
          {identity}
          {canView ? (
            <Link to={`/u/${owner.username}`} className="shrink-0 text-xs font-semibold text-leaf-deep">
              Lihat Profil
            </Link>
          ) : (
            <PrivateTag />
          )}
        </div>
      </Section>
    )
  }

  return (
    <section className={card}>
      <h2 className="mb-3 font-heading text-sm font-bold">Pendaki</h2>
      <div className="flex items-center gap-3">{identity}</div>
      {canView ? (
        <Link
          to={`/u/${owner.username}`}
          className="mt-3.5 block rounded-xl border border-line bg-paper py-2.5 text-center text-[13px] font-semibold hover:bg-stone"
        >
          Lihat Profil
        </Link>
      ) : (
        <p className="mt-3.5 flex items-center justify-center gap-1.5 rounded-xl bg-stone py-2.5 text-xs text-mute">
          <Lock size={12} />
          Profil privat
        </p>
      )}
    </section>
  )
}

function MemberRow({ member, index }) {
  const canView = !member.isOwner && member.isProfilePublic && member.username
  const body = (
    <>
      <Avatar name={member.name} size={34} style={{ background: palette[index % palette.length] }} />
      <div className="min-w-0 flex-1">
        <b className="block truncate text-[13px]">{member.name}</b>
        <span className="text-[11px] text-mute">
          {member.username && `@${member.username}`}
          {member.isOwner && ' · Pemilik entri'}
        </span>
      </div>
      {canView && <ChevronRight size={16} className="shrink-0 text-mute" />}
      {!member.isOwner && !canView && <PrivateTag />}
    </>
  )
  const row = 'flex items-center gap-3 py-2'

  return canView ? (
    <li>
      <Link to={`/u/${member.username}`} className={`${row} -mx-2 rounded-xl px-2 hover:bg-stone`}>
        {body}
      </Link>
    </li>
  ) : (
    <li className={row}>{body}</li>
  )
}

export function CrewSection({ crew, variant }) {
  const list = (
    <ul>
      {crew.map((m, i) => (
        <MemberRow key={`${m.username}-${i}`} member={m} index={i} />
      ))}
    </ul>
  )

  if (variant === 'mobile') {
    return (
      <Section title="Rombongan" className="md:hidden">
        {list}
      </Section>
    )
  }

  return (
    <section className={card}>
      <h2 className="mb-2 font-heading text-sm font-bold">Rombongan</h2>
      {list}
    </section>
  )
}
