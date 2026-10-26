import { Check, Plus, Trash2 } from 'lucide-react'
import { initialsOf } from '../../../utils/initials'

function groupByCategory(items) {
  const groups = new Map()
  items.forEach((item) => {
    if (!groups.has(item.category)) groups.set(item.category, [])
    groups.get(item.category).push(item)
  })
  return [...groups]
}

function Who({ name }) {
  return (
    <span
      title={name}
      className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-[#E7F0E1] font-heading text-[9.5px] font-bold text-pine-deep md:size-[26px] md:text-[10px]"
    >
      {initialsOf(name)}
    </span>
  )
}

function ItemRow({ item, viewerId, owner, canDelete, busy, onClaim, onUnclaim, onToggle, onDelete }) {
  const mine = item.ownerId === viewerId
  const unclaimed = !item.ownerId

  const boxState = item.done
    ? 'border-leaf bg-leaf text-white'
    : mine
      ? 'border-pine bg-paper'
      : 'border-line bg-stone'

  return (
    <li
      className={`mb-2 flex items-center gap-2.5 rounded-xl border bg-paper px-3 py-2.5 last:mb-0 md:mb-[9px] md:gap-[13px] md:rounded-[13px] md:px-3.5 md:py-3 ${
        unclaimed ? 'border-dashed border-line' : 'border-line'
      }`}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={item.done}
        aria-label={`${item.name}${mine ? '' : ', hanya pemilik yang bisa mencentang'}`}
        disabled={!mine || busy}
        onClick={() => onToggle(item, !item.done)}
        className={`flex size-[19px] shrink-0 items-center justify-center rounded-md border-[1.5px] md:size-[21px] md:rounded-[7px] ${boxState} ${
          mine ? 'cursor-pointer' : 'cursor-default'
        }`}
      >
        {item.done && <Check size={12} strokeWidth={3} />}
      </button>

      <span
        className={`min-w-0 flex-1 text-[12.5px] md:text-sm ${
          item.done ? 'text-mute line-through' : !unclaimed && !mine ? 'text-mute' : ''
        }`}
      >
        {item.name}
      </span>

      {unclaimed && (
        <button
          type="button"
          disabled={busy}
          onClick={() => onClaim(item)}
          className="shrink-0 whitespace-nowrap rounded-full bg-[#E7F0E1] px-2.5 py-[5px] text-[10.5px] font-semibold text-pine-deep disabled:opacity-60 md:px-3.5 md:py-1.5 md:text-xs"
        >
          Klaim
        </button>
      )}
      {mine && !item.done && (
        <button
          type="button"
          disabled={busy}
          onClick={() => onUnclaim(item)}
          className="shrink-0 whitespace-nowrap text-[10.5px] font-semibold text-warn disabled:opacity-60 md:text-xs"
        >
          Batal
        </button>
      )}
      {!unclaimed && !mine && !item.done && owner && (
        <span className="hidden text-[11px] text-mute md:inline">Diklaim {owner.name.split(' ')[0]}</span>
      )}
      {owner && <Who name={owner.name} />}

      {canDelete && (
        <button
          type="button"
          disabled={busy}
          onClick={() => onDelete(item)}
          aria-label={`Hapus ${item.name}`}
          className="flex size-7 shrink-0 items-center justify-center rounded-full text-mute hover:bg-warnbg hover:text-warn disabled:opacity-60"
        >
          <Trash2 size={14} />
        </button>
      )}
    </li>
  )
}

export default function ItemList({ checklist: c, busy, onClaim, onUnclaim, onToggle, onDelete, onAdd }) {
  const groups = groupByCategory(c.items)
  const memberById = new Map(c.members.map((m) => [m.id, m]))
  const isLeader = c.role === 'leader'

  // anggota yang menambahkan barang boleh menghapusnya selama belum diklaim orang lain
  const canDelete = (item) => isLeader || (item.addedBy === c.viewerId && !item.ownerId)

  return (
    <div>
      {groups.length === 0 && (
        <p className="mx-5 my-3.5 rounded-xl border border-dashed border-line bg-paper px-4 py-8 text-center text-xs text-mute md:mx-0 md:rounded-[18px] md:py-10 md:text-[13px]">
          Belum ada barang. Tambahkan barang pertama untuk checklist ini.
        </p>
      )}

      {groups.map(([category, items]) => (
        <section key={category} className="px-5 py-3.5 md:mb-4 md:rounded-[18px] md:border md:border-line md:bg-paper md:px-[22px] md:py-5">
          <div className="mb-2 flex items-center justify-between md:mb-3">
            <h2 className="font-heading text-[13px] font-bold md:text-base">{category}</h2>
            <span className="text-[11px] text-mute md:text-xs">
              {items.filter((i) => i.done).length}/{items.length}
            </span>
          </div>
          <ul>
            {items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                viewerId={c.viewerId}
                owner={item.ownerId ? memberById.get(item.ownerId) : null}
                canDelete={canDelete(item)}
                busy={busy}
                onClaim={onClaim}
                onUnclaim={onUnclaim}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            ))}
          </ul>
        </section>
      ))}

      <div className="px-5 pb-1 pt-1 md:px-0 md:pb-[22px] md:pt-1">
        <button
          type="button"
          onClick={onAdd}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-line bg-paper py-2.5 text-xs font-semibold text-pine-deep hover:bg-[#EEF2EA] md:rounded-[14px] md:border-[1.5px] md:py-[13px] md:text-[13px]"
        >
          <Plus size={14} />
          Tambah Barang
        </button>
      </div>
    </div>
  )
}
