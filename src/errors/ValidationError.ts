import { PayNexusError } from './PayNexusError.js';

export class ValidationError extends PayNexusError {
  constructor(message: string = 'Validation failed', requestId?: string) {
    super(message, 400, requestId);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
