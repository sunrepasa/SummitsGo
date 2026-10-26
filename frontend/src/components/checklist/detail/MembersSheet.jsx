import { UserPlus } from 'lucide-react'
import BottomSheet from '../../ui/BottomSheet'
import MemberList from './MemberList'

// hanya tampil di mobile (BottomSheet tanpa prop modal); di desktop anggota ada di sidebar
export default function MembersSheet({ checklist, busy, onClose, onKick, onCancelInvite, onInvite }) {
  return (
    <BottomSheet
      open
      onClose={onClose}
      title="Anggota rombongan"
      footer={
        checklist.role === 'leader' && (
          <button
            type="button"
            onClick={onInvite}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-pine py-3 text-[13.5px] font-semibold text-white"
          >
            <UserPlus size={15} />
            Undang Anggota
          </button>
        )
      }
    >
      <div className="pb-3">
        <MemberList checklist={checklist} busy={busy} onKick={onKick} onCancelInvite={onCancelInvite} />
      </div>
    </BottomSheet>
  )
}
