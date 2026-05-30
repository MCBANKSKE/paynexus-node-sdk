import { PayNexusError } from './PayNexusError.js';

export class NotFoundError extends PayNexusError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'not_found');
    this.name = 'NotFoundError';
  }
}
