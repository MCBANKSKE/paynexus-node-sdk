import EventEmitter3 from 'eventemitter3';
import type { PaymentData } from '../types/index.js';
import type { WebhookEvent } from '../types/webhooks.js';

export interface PaymentEventData {
  payment: PaymentData;
  payload?: any;
  reason?: string;
}

export class PayNexusEventEmitter extends EventEmitter3 {
  constructor() {
    super();
  }

  // Payment events
  onPaymentCompleted(callback: (data: PaymentEventData) => void): void {
    this.on('payment.completed', callback);
  }

  onPaymentFailed(callback: (data: PaymentEventData) => void): void {
    this.on('payment.failed', callback);
  }

  onPaymentInitiated(callback: (data: PaymentEventData) => void): void {
    this.on('payment.initiated', callback);
  }

  // Webhook events
  onWebhookReceived(callback: (event: WebhookEvent) => void): void {
    this.on('webhook.received', callback);
  }

  onWebhookVerificationFailed(callback: (error: Error) => void): void {
    this.on('webhook.verification_failed', callback);
  }

  // Emit events
  emitPaymentCompleted(data: PaymentEventData): void {
    this.emit('payment.completed', data);
  }

  emitPaymentFailed(data: PaymentEventData): void {
    this.emit('payment.failed', data);
  }

  emitPaymentInitiated(data: PaymentEventData): void {
    this.emit('payment.initiated', data);
  }

  emitWebhookReceived(event: WebhookEvent): void {
    this.emit('webhook.received', event);
  }

  emitWebhookVerificationFailed(error: Error): void {
    this.emit('webhook.verification_failed', error);
  }
}
