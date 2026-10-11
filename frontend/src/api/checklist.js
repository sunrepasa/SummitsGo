import client from './client'
import { USE_MOCK } from '../config'
import { checklists } from '../data/checklists'
import { mountains } from '../data/mountains'
import { myTemplates, systemTemplates } from '../data/templates'
import { wait } from './mockDelay'

export async function getMyChecklists() {
  if (USE_MOCK) {
    return wait(
      checklists.map(({ mountainId, ...entry }) => ({
        ...entry,
        mountain: mountains.find((m) => m.id === mountainId),
      })),
    )
  }
  const { data } = await client.get('/checklists')
  return data
}

export async function getChecklistTemplates() {
  if (USE_MOCK) return wait({ mine: myTemplates, system: systemTemplates }, 200)
  const { data } = await client.get('/checklist-templates')
  return data
}

export async function createChecklist({ mountainId, route, plannedDate, templateId, leaderName }) {
  if (USE_MOCK) {
    const template = [...myTemplates, ...systemTemplates].find((t) => t.id === templateId)
    checklists.unshift({
      id: `cl-${Date.now()}`,
      mountainId,
      route,
      plannedDate: plannedDate || null,
      role: 'leader',
      done: 0,
      total: template?.itemCount ?? 0,
      members: [leaderName],
    })
    return wait(null, 500)
  }
  await client.post('/checklists', {
    mountainId,
    route,
    plannedDate: plannedDate || undefined,
    templateId: templateId || undefined,
  })
}