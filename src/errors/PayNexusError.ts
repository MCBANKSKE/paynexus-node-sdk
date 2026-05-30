export class PayNexusError extends Error {
  readonly status?: number;
  readonly code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'PayNexusError';
    this.status = status;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
