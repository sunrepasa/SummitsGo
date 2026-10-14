import { Routes, Route } from 'react-router-dom'
import UserLayout from './components/layout/UserLayout'
import TopBar from './components/layout/TopBar'
import AuthPage from './pages/auth/AuthPage'
import Home from './pages/user/Home'
import SearchPage from './pages/user/Search'
import Profile from './pages/user/Profile'
import Logbook from './pages/user/Logbook'
import Checklist from './pages/user/Checklist'
import MountainDetail from './pages/user/MountainDetail'
import ChecklistDetail from './pages/user/ChecklistDetail'

function Placeholder({ title }) {
  return (
    <>
      <TopBar title={title} />
      <div className="px-5 md:px-0">
        <h1 className="hidden pt-8 font-heading text-2xl font-bold md:block">{title}</h1>
      </div>
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />

      <Route element={<UserLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/checklist" element={<Checklist />} />
        <Route path="/checklist/:id" element={<ChecklistDetail />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/mountain/:id" element={<MountainDetail />} />
        <Route path="/logbook" element={<Logbook />} />
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