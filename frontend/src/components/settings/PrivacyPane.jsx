import PublicLogbookList from './PublicLogbookList'
import { SettingRow, SettingsCard } from './SettingsParts'
import Toggle from '../ui/Toggle'
import { useProfileVisibility } from '../../hooks/useProfileVisibility'

export default function PrivacyPane() {
  const { isPublic, saving, change } = useProfileVisibility()

  return (
    <>
      <SettingsCard title="Privasi" desc="Atur apa yang bisa dilihat orang lain.">
        <SettingRow title="Profil Publik" desc="Orang lain bisa melihat profilmu lewat link">
          <Toggle checked={isPublic} disabled={saving} onChange={change} label="Profil publik" />
        </SettingRow>
        {!isPublic && (
          <p className="rounded-[10px] bg-stone px-3 py-2.5 text-[11.5px] leading-normal text-mute">
            Profilmu disembunyikan. Entri yang berstatus publik tetap bisa dibuka lewat tautannya masing-masing.
          </p>
        )}
      </SettingsCard>

      <SettingsCard
        title="Logbook Ditampilkan Publik"
        desc="Entri yang diaktifkan tampil di profil publikmu dan bisa dibuka lewat tautan. Entri yang tidak diaktifkan tetap privat."
      >
        <div className="mt-3">
          <PublicLogbookList />
        </div>
      </SettingsCard>
    </>
  )
}
