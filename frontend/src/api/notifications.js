import client from './client'
import { USE_MOCK } from '../config'
import { notifications } from '../data/notifications'
import { wait } from './mockDelay'

// dipakai ikon lonceng di navigasi agar angka belum-dibaca ikut berubah
export const NOTIFICATIONS_CHANGED = 'summitsgo:notifications-changed'
const announce = () => window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED))

// Terbaru di atas. Backend nyata: GET /notifications
export async function getNotifications() {
  if (USE_MOCK) {
    return wait([...notifications].sort((a, b) => b.createdAt - a.createdAt).map((n) => ({ ...n })), 250)
  }
  const { data } = await client.get('/notifications')
  return data
}

// Backend nyata: GET /notifications/unread-count -> { count }
export async function getUnreadCount() {
  if (USE_MOCK) return wait(notifications.filter((n) => !n.read).length, 100)
  const { data } = await client.get('/notifications/unread-count')
  return data.count
}

// PATCH /notifications/:id/read
export async function markNotificationRead(id) {
  if (USE_MOCK) {
    const found = notifications.find((n) => n.id === id)
    if (found) found.read = true
    announce()
    return wait(null, 100)
  }
  await client.patch(`/notifications/${id}/read`)
  announce()
}

// POST /notifications/read-all
export async function markAllNotificationsRead() {
  if (USE_MOCK) {
    notifications.forEach((n) => {
      n.read = true
    })
    announce()
    return wait(null, 200)
  }
  await client.post('/notifications/read-all')
  announce()
}

// DELETE /notifications/:id
export async function deleteNotification(id) {
  if (USE_MOCK) {
    const index = notifications.findIndex((n) => n.id === id)
    if (index !== -1) notifications.splice(index, 1)
    announce()
    return wait(null, 150)
  }
  await client.delete(`/notifications/${id}`)
  announce()
}

// DELETE /notifications?status=read  (hanya yang sudah dibaca)
export async function deleteReadNotifications() {
  if (USE_MOCK) {
    for (let i = notifications.length - 1; i >= 0; i -= 1) {
      if (notifications[i].read) notifications.splice(i, 1)
    }
    announce()
    return wait(null, 250)
  }
  await client.delete('/notifications', { params: { status: 'read' } })
  announce()
}

// DELETE /notifications  (semuanya)
export async function deleteAllNotifications() {
  if (USE_MOCK) {
    notifications.splice(0, notifications.length)
    announce()
    return wait(null, 250)
  }
  await client.delete('/notifications')
  announce()
}
