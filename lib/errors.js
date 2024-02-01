export class ForbiddenAccessError extends Error {
  constructor() {
    super();
    this.message = 'Access denied';
  }
}
