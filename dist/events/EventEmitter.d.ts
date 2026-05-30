import EventEmitter3 from 'eventemitter3';
import type { PaymentData } from '../types/index.js';
import type { WebhookEvent } from '../types/webhooks.js';
export interface PaymentEventData {
    payment: PaymentData;
    payload?: any;
    reason?: string;
}
export declare class PayNexusEventEmitter extends EventEmitter3 {
    constructor();
    onPaymentCompleted(callback: (data: PaymentEventData) => void): void;
    onPaymentFailed(callback: (data: PaymentEventData) => void): void;
    onPaymentInitiated(callback: (data: PaymentEventData) => void): void;
    onWebhookReceived(callback: (event: WebhookEvent) => void): void;
    onWebhookVerificationFailed(callback: (error: Error) => void): void;
    emitPaymentCompleted(data: PaymentEventData): void;
    emitPaymentFailed(data: PaymentEventData): void;
    emitPaymentInitiated(data: PaymentEventData): void;
    emitWebhookReceived(event: WebhookEvent): void;
    emitWebhookVerificationFailed(error: Error): void;
}
//# sourceMappingURL=EventEmitter.d.ts.map