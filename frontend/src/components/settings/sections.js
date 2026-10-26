import { CircleHelp, Info, KeyRound, Lock, UserRound } from 'lucide-react'
import AboutPane from './AboutPane'
import AccountPane from './AccountPane'
import HelpPane from './HelpPane'
import PrivacyPane from './PrivacyPane'
import SecurityPane from './SecurityPane'

// grup dan urutan mengikuti sidebar desktop; id dipakai sebagai segmen URL /settings/:id
export const SECTION_GROUPS = [
  {
    label: 'Akun',
    items: [
      { id: 'account', label: 'Informasi Akun', title: 'Informasi Akun', icon: UserRound, Pane: AccountPane },
      { id: 'security', label: 'Keamanan', title: 'Keamanan', icon: KeyRound, Pane: SecurityPane },
    ],
  },
  {
    label: 'Privasi',
    items: [
      { id: 'privacy', label: 'Profil & Logbook Publik', title: 'Privasi', icon: Lock, Pane: PrivacyPane },
    ],
  },
  {
    label: 'Lainnya',
    items: [
      { id: 'help', label: 'Bantuan & Dukungan', title: 'Bantuan & Dukungan', icon: CircleHelp, Pane: HelpPane },
      { id: 'about', label: 'Tentang SummitsGo', title: 'Tentang SummitsGo', icon: Info, Pane: AboutPane },
    ],
  },
]

export const SECTIONS = Object.fromEntries(SECTION_GROUPS.flatMap((g) => g.items).map((s) => [s.id, s]))
export const DEFAULT_SECTION = 'account'
