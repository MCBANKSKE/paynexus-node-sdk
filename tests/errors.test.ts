import {
  PayNexusError,
  AuthenticationError,
  ValidationError,
  RateLimitError,
  APIConnectionError,
  WebhookVerificationError,
} from '../src/errors';

describe('Error classes', () => {
  describe('PayNexusError', () => {
    it('sets message and name', () => {
      const error = new PayNexusError('test error');
      expect(error.message).toBe('test error');
      expect(error.name).toBe('PayNexusError');
      expect(error).toBeInstanceOf(Error);
    });

    it('sets statusCode and requestId', () => {
      const error = new PayNexusError('test', 500, 'req_123');
      expect(error.statusCode).toBe(500);
      expect(error.requestId).toBe('req_123');
    });
  });

  describe('AuthenticationError', () => {
    it('has correct defaults', () => {
      const error = new AuthenticationError();
      expect(error.message).toBe('Authentication failed');
      expect(error.name).toBe('AuthenticationError');
      expect(error.statusCode).toBe(401);
      expect(error).toBeInstanceOf(PayNexusError);
    });

    it('accepts custom message and requestId', () => {
      const error = new AuthenticationError('Bad key', 'req_abc');
      expect(error.message).toBe('Bad key');
      expect(error.requestId).toBe('req_abc');
    });
  });

  describe('ValidationError', () => {
    it('has correct defaults', () => {
      const error = new ValidationError();
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error).toBeInstanceOf(PayNexusError);
    });
  });

  describe('RateLimitError', () => {
    it('has correct defaults', () => {
      const error = new RateLimitError();
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.statusCode).toBe(429);
      expect(error).toBeInstanceOf(PayNexusError);
    });
  });

  describe('APIConnectionError', () => {
    it('has correct defaults', () => {
      const error = new APIConnectionError();
      expect(error.message).toBe('Unable to connect to PayNexus API');
      expect(error.statusCode).toBe(503);
      expect(error).toBeInstanceOf(PayNexusError);
    });
  });

  describe('WebhookVerificationError', () => {
    it('has correct defaults', () => {
      const error = new WebhookVerificationError();
      expect(error.message).toBe('Webhook signature verification failed');
      expect(error.statusCode).toBe(403);
      expect(error).toBeInstanceOf(PayNexusError);
    });
  });

  it('instanceof checks work through prototype chain', () => {
    const authError = new AuthenticationError();
    expect(authError instanceof AuthenticationError).toBe(true);
    expect(authError instanceof PayNexusError).toBe(true);
    expect(authError instanceof Error).toBe(true);

    const validationError = new ValidationError();
    expect(validationError instanceof ValidationError).toBe(true);
    expect(validationError instanceof PayNexusError).toBe(true);
  });
});
