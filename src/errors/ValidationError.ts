import { PayNexusError } from './PayNexusError.js';

export class ValidationError extends PayNexusError {
  readonly errors?: Record<string, string[]>;

  constructor(message: string, errors?: Record<string, string[]>) {
    super(message, 422, 'validation_error');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}
