import { PayNexusEventEmitter } from '../src/events/EventEmitter';

describe('PayNexusEventEmitter', () => {
  let emitter: PayNexusEventEmitter;

  beforeEach(() => {
    emitter = new PayNexusEventEmitter();
  });

  it('emits and receives payment.completed events', () => {
    const callback = jest.fn();
    emitter.onPaymentCompleted(callback);

    const eventData = { payment: { amount: 1000, currency: 'KES', phone: '254712345678', status: 'completed' as const } };
    emitter.emitPaymentCompleted(eventData);

    expect(callback).toHaveBeenCalledWith(eventData);
  });

  it('emits and receives payment.failed events', () => {
    const callback = jest.fn();
    emitter.onPaymentFailed(callback);

    const eventData = { payment: { amount: 500, currency: 'KES', phone: '254712345678', status: 'failed' as const }, reason: 'Insufficient funds' };
    emitter.emitPaymentFailed(eventData);

    expect(callback).toHaveBeenCalledWith(eventData);
  });

  it('emits and receives payment.initiated events', () => {
    const callback = jest.fn();
    emitter.onPaymentInitiated(callback);

    const eventData = { payment: { amount: 2000, currency: 'KES', phone: '254712345678', status: 'pending' as const } };
    emitter.emitPaymentInitiated(eventData);

    expect(callback).toHaveBeenCalledWith(eventData);
  });

  it('emits and receives webhook.received events', () => {
    const callback = jest.fn();
    emitter.onWebhookReceived(callback);

    const event = {
      event: 'payment.completed' as const,
      data: {
        payment: { amount: 1000, currency: 'KES', phone: '254712345678', status: 'completed' as const },
        transaction_id: 'tx_123',
        provider_reference: 'ref_456',
      },
    };
    emitter.emitWebhookReceived(event);

    expect(callback).toHaveBeenCalledWith(event);
  });

  it('emits and receives webhook.verification_failed events', () => {
    const callback = jest.fn();
    emitter.onWebhookVerificationFailed(callback);

    const error = new Error('Bad signature');
    emitter.emitWebhookVerificationFailed(error);

    expect(callback).toHaveBeenCalledWith(error);
  });

  it('supports multiple listeners for the same event', () => {
    const cb1 = jest.fn();
    const cb2 = jest.fn();
    emitter.onPaymentCompleted(cb1);
    emitter.onPaymentCompleted(cb2);

    const eventData = { payment: { amount: 100, currency: 'KES', phone: '254712345678', status: 'completed' as const } };
    emitter.emitPaymentCompleted(eventData);

    expect(cb1).toHaveBeenCalled();
    expect(cb2).toHaveBeenCalled();
  });
});
