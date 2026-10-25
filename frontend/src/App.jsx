import { Routes, Route } from 'react-router-dom'
import UserLayout from './components/layout/UserLayout'
import AuthPage from './pages/auth/AuthPage'
import Home from './pages/user/Home'
import SearchPage from './pages/user/Search'
import Profile from './pages/user/Profile'
import Logbook from './pages/user/Logbook'
import Checklist from './pages/user/Checklist'
import MountainDetail from './pages/user/MountainDetail'
import ChecklistDetail from './pages/user/ChecklistDetail'
import LogbookDetail from './pages/user/LogbookDetail'
import Settings from './pages/user/Settings'
import PublicLogbookSettings from './pages/user/PublicLogbookSettings'
import PublicProfile from './pages/user/PublicProfile'
import PublicEntry from './pages/user/PublicEntry'
import MapPage from './pages/user/MapPage'
import SavedMaps from './pages/user/SavedMaps'
import Dashboard from './pages/user/Dashboard'
import JoinChecklist from './pages/user/JoinChecklist'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      {/* peta layar penuh tanpa navigasi, dan terbuka untuk guest */}
      <Route path="/mountain/:id/map" element={<MapPage />} />

      <Route element={<UserLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/checklist" element={<Checklist />} />
        <Route path="/checklist/:id" element={<ChecklistDetail />} />
        <Route path="/join/:code" element={<JoinChecklist />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/mountain/:id" element={<MountainDetail />} />
        <Route path="/logbook" element={<Logbook />} />
        <Route path="/logbook/:id" element={<LogbookDetail />} />
        <Route path="/u/:username" element={<PublicProfile />} />
        <Route path="/e/:slug" element={<PublicEntry />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/public-logbook" element={<PublicLogbookSettings />} />
        <Route path="/settings/:section" element={<Settings />} />
        <Route path="/saved-maps" element={<SavedMaps />} />
      </Route>
    </Routes>
  )
}