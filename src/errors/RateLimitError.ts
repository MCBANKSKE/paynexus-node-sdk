import { PayNexusError } from './PayNexusError.js';

export class RateLimitError extends PayNexusError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429, 'rate_limit_error');
    this.name = 'RateLimitError';
  }
}
