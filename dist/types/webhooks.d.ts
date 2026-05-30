import type { PaymentData } from './index.js';
export interface PaymentCompletedWebhook {
    event: 'payment.completed';
    data: {
        payment: PaymentData;
        transaction_id: string;
        provider_reference: string;
    };
}
export interface PaymentFailedWebhook {
    event: 'payment.failed';
    data: {
        payment: PaymentData;
        failure_reason: string;
    };
}
export type WebhookEvent = PaymentCompletedWebhook | PaymentFailedWebhook;
//# sourceMappingURL=webhooks.d.ts.map