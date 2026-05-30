import {
  PayNexusError,
  AuthenticationError,
  ValidationError,
  RateLimitError,
  NotFoundError,
  WebhookVerificationError,
} from '../src/errors/index.js';

describe('Error hierarchy', () => {
  it('PayNexusError has status and code', () => {
    const err = new PayNexusError('boom', 500, 'internal');
    expect(err.message).toBe('boom');
    expect(err.status).toBe(500);
    expect(err.code).toBe('internal');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(PayNexusError);
    expect(err.name).toBe('PayNexusError');
  });

  it('AuthenticationError defaults', () => {
    const err = new AuthenticationError();
    expect(err.status).toBe(401);
    expect(err.code).toBe('authentication_error');
    expect(err).toBeInstanceOf(PayNexusError);
    expect(err.name).toBe('AuthenticationError');
  });

  it('ValidationError carries field errors', () => {
    const errors = { phone: ['Invalid phone number'] };
    const err = new ValidationError('Validation failed', errors);
    expect(err.status).toBe(422);
    expect(err.errors).toEqual(errors);
    expect(err).toBeInstanceOf(PayNexusError);
  });

  it('RateLimitError defaults', () => {
    const err = new RateLimitError();
    expect(err.status).toBe(429);
    expect(err.name).toBe('RateLimitError');
  });

  it('NotFoundError defaults', () => {
    const err = new NotFoundError();
    expect(err.status).toBe(404);
    expect(err.name).toBe('NotFoundError');
  });

  it('WebhookVerificationError defaults', () => {
    const err = new WebhookVerificationError();
    expect(err.status).toBe(400);
    expect(err.code).toBe('webhook_verification_error');
    expect(err.name).toBe('WebhookVerificationError');
  });
});
