import { Routes, Route, useNavigate } from 'react-router-dom'
import UserLayout from './components/layout/UserLayout'
import TopBar from './components/layout/TopBar'
import { useAuth } from './context/AuthContext'
import SearchPage from './pages/user/Search'
import Profile from './pages/user/Profile'

function Placeholder({ title, children }) {
  return (
    <>
      <TopBar title={title} />
      <div className="px-5 md:px-0">
        <h1 className="hidden pt-8 font-heading text-2xl font-bold md:block">{title}</h1>
        {children}
      </div>
    </>
  )
}

// sementara — diganti halaman Login asli saat mockup Login/Register masuk
function DevLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const enter = () => {
    login({ token: 'dev-token', user: { name: 'Sayz', username: 'sayz', role: 'user' } })
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-[390px] p-6">
      <h1 className="font-heading text-2xl font-bold">Masuk</h1>
      <p className="mt-2 text-[13px] text-mute">Halaman sementara untuk uji navigasi.</p>
      <button
        type="button"
        onClick={enter}
        className="mt-6 w-full rounded-xl bg-pine py-3 text-[13.5px] font-semibold text-white"
      >
        Masuk sebagai Sayz (tiruan)
      </button>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<DevLogin />} />
      <Route path="/register" element={<Placeholder title="Daftar" />} />

      <Route element={<UserLayout />}>
        <Route path="/" element={<Placeholder title="Beranda" />} />
        <Route path="/checklist" element={<Placeholder title="Checklist Saya" />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/logbook" element={<Placeholder title="Logbook" />} />
        <Route path="/logbook/:id" element={<Placeholder title="Detail Logbook" />} />
        <Route path="/u/:username" element={<Placeholder title="Profil Publik" />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Placeholder title="Dashboard Saya" />} />
        <Route path="/settings" element={<Placeholder title="Pengaturan & Privasi" />} />
        <Route path="/saved-maps" element={<Placeholder title="Peta Tersimpan" />} />
      </Route>
    </Routes>
  )
}