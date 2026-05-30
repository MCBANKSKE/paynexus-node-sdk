import type { WebhookEvent } from '../types/webhooks.js';
export declare class WebhookConstructor {
    private verifier;
    constructor(secret: string);
    constructEvent(payload: string, signature: string, timestamp?: string): WebhookEvent;
}
//# sourceMappingURL=constructor.d.ts.map