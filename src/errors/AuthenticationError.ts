import { PayNexusError } from './PayNexusError.js';

export class AuthenticationError extends PayNexusError {
  constructor(message = 'Invalid or missing API key') {
    super(message, 401, 'authentication_error');
    this.name = 'AuthenticationError';
  }
}
