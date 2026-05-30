export class PayNexusError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public requestId?: string
  ) {
    super(message);
    this.name = 'PayNexusError';
    Object.setPrototypeOf(this, PayNexusError.prototype);
  }
}
