import { PayNexusError } from './PayNexusError.js';

export class AuthenticationError extends PayNexusError {
  constructor(message: string = 'Authentication failed', requestId?: string) {
    super(message, 401, requestId);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}
