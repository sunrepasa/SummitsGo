import client from './client'
import { USE_MOCK } from '../config'
import { mountains } from '../data/mountains'
import { mountainDetails } from '../data/mountainDetails'
import { getRouteGeometry } from '../data/routeMaps'
import { wait } from './mockDelay'
import { mapIdOf } from '../utils/savedMaps'
import { readRouteData } from '../utils/offlineMaps'

const codedError = (message, code, status) => Object.assign(new Error(message), { code, status })

// Peta satu jalur: garis jalur, titik basecamp/pos/puncak, dan fasilitas tiap pos.
// Endpoint publik (tanpa JWT) karena peta wajib bisa dibuka guest:
// GET /api/v1/public/mountains/:id/routes/:route/map
//
// Bentuk respons:
// { mountain: { id, name, elevation }, route, path: [[lat, lng], ...],
//   checkpoints: [{ type: 'basecamp' | 'post' | 'summit', name, lat, lng, pathIndex,
//                   facilities, dangerNote, distance, duration }] }
// path harus rapat (titik tiap puluhan meter) karena posisi pendaki dicocokkan ke titik terdekat.
export async function getRouteMap(mountainId, routeName) {
  if (USE_MOCK) {
    const mountain = mountains.find((m) => m.id === mountainId)
    const detail = mountainDetails[mountainId]?.routes.find((r) => r.name === routeName)
    const geometry = getRouteGeometry(mountainId, routeName)

    if (!mountain || !detail?.mapAvailable || !geometry) {
      await wait(null, 300)
      throw codedError('Peta jalur ini belum tersedia', 'NOT_FOUND', 404)
    }

    const checkpoints = geometry.checkpoints.map((c) => {
      if (c.type === 'basecamp') {
        return { ...c, name: detail.basecamp.name, facilities: [], distance: null, duration: null }
      }
      if (c.type === 'summit') {
        return { ...c, name: geometry.summitName, facilities: [], distance: null, duration: null }
      }
      const post = detail.posts.find((p) => p.name === c.name)
      return {
        ...c,
        facilities: post?.facilities ?? [],
        dangerNote: post?.dangerNote,
        distance: post?.distance ?? null,
        duration: post?.duration ?? null,
      }
    })

    return wait(
      {
        mountain: { id: mountain.id, name: mountain.name, elevation: mountain.elevation },
        route: routeName,
        path: geometry.path,
        checkpoints,
      },
      400,
    )
  }
  try {
    const { data } = await client.get(`/public/mountains/${mountainId}/routes/${encodeURIComponent(routeName)}/map`)
    return data
  } catch (err) {
    // gagal jaringan (tanpa respons server) dan peta ini pernah diunduh: pakai data jalur yang tersimpan
    if (!err.response) {
      const offline = await readRouteData(mapIdOf(mountainId, routeName))
      if (offline) return offline
    }
    throw err
  }
}
