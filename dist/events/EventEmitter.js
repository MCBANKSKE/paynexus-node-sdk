import EventEmitter3 from 'eventemitter3';
export class PayNexusEventEmitter extends EventEmitter3 {
    constructor() {
        super();
    }
    // Payment events
    onPaymentCompleted(callback) {
        this.on('payment.completed', callback);
    }
    onPaymentFailed(callback) {
        this.on('payment.failed', callback);
    }
    onPaymentInitiated(callback) {
        this.on('payment.initiated', callback);
    }
    // Webhook events
    onWebhookReceived(callback) {
        this.on('webhook.received', callback);
    }
    onWebhookVerificationFailed(callback) {
        this.on('webhook.verification_failed', callback);
    }
    // Emit events
    emitPaymentCompleted(data) {
        this.emit('payment.completed', data);
    }
    emitPaymentFailed(data) {
        this.emit('payment.failed', data);
    }
    emitPaymentInitiated(data) {
        this.emit('payment.initiated', data);
    }
    emitWebhookReceived(event) {
        this.emit('webhook.received', event);
    }
    emitWebhookVerificationFailed(error) {
        this.emit('webhook.verification_failed', error);
    }
}
//# sourceMappingURL=EventEmitter.js.map