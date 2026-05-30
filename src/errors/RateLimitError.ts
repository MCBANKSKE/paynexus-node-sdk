import { PayNexusError } from './PayNexusError.js';

export class RateLimitError extends PayNexusError {
  constructor(message: string = 'Rate limit exceeded', requestId?: string) {
    super(message, 429, requestId);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}
