export class AppError extends Error {
  constructor(message, code, status = 400) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.status = status
  }
}
