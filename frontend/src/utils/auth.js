const AUTH_PATH = /^\/(login|register)(\/|\?|$)/

const isInternalPath = (path) =>
  typeof path === 'string' && path.startsWith('/') && !path.startsWith('//')

// tujuan setelah masuk: area admin sendiri, atau halaman asal pengguna, atau Beranda
export function homeFor(user, from) {
  // area admin dibuat di tahap berikutnya, jadi rute /admin belum ada
  if (user?.role === 'admin') return '/admin'
  return isInternalPath(from) && !AUTH_PATH.test(from) ? from : '/'
}