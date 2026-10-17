// true bila teks tersalin; false bila browser menolak (mis. bukan HTTPS atau izin ditolak)
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export const publicProfileUrl = (username) => `${window.location.origin}/u/${username}`
export const publicEntryUrl = (slug) => `${window.location.origin}/e/${slug}`
