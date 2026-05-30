import { PayNexusError } from './PayNexusError.js';

export class APIConnectionError extends PayNexusError {
  constructor(message: string = 'Unable to connect to PayNexus API', requestId?: string) {
    super(message, 503, requestId);
    this.name = 'APIConnectionError';
    Object.setPrototypeOf(this, APIConnectionError.prototype);
  }
}
