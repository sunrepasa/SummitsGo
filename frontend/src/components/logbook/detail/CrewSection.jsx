import Avatar from '../../ui/Avatar'
import AvatarStack from '../../ui/AvatarStack'
import Section from '../../mountain/detail/Section'
import { ME_ID } from '../../../data/people'

const palette = ['#1F3A2E', '#4E7A3B', '#5A7A8C', '#7A5A3E']

// mobile: tumpukan avatar satu baris; desktop: daftar nama di sidebar
export default function CrewSection({ crew, checklistName, variant }) {
  if (variant === 'mobile') {
    return (
      <Section title="Rombongan" className="md:hidden">
        <div className="flex items-center gap-2">
          <AvatarStack names={crew.map((m) => m.name)} />
          <span className="ml-1 text-[11.5px] text-mute">
            {crew.length} orang{checklistName && ` · dari Checklist "${checklistName}"`}
          </span>
        </div>
      </Section>
    )
  }

  return (
    <section className="hidden rounded-[18px] border border-line bg-paper p-[22px] md:block">
      <h2 className="mb-2 font-heading text-[15px] font-bold">Rombongan</h2>
      <ul>
        {crew.map((m, i) => (
          <li key={m.id} className="flex items-center gap-[11px] py-2">
            <Avatar name={m.name} size={32} style={{ background: palette[i % palette.length] }} />
            <b className="text-[13px]">
              {m.name}
              {m.id === ME_ID && ' (kamu)'}
            </b>
          </li>
        ))}
      </ul>
      {checklistName && <p className="mt-2 text-[11.5px] text-mute">Dari checklist &quot;{checklistName}&quot;</p>}
    </section>
  )
}
