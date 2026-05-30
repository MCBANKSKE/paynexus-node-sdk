import { HttpClient } from '../http.js';
import type { WebhookResponse, WebhooksListResponse, UpdateWebhookData, DeleteResponse, RequestOptions } from '../../types/index.js';
import type { WebhookEvent } from '../../types/webhooks.js';
export declare class WebhooksResource {
    private httpClient;
    private verifier;
    constructor(httpClient: HttpClient, webhookSecret?: string);
    verifySignature(payload: string, signature: string): boolean;
    constructEvent(payload: string, signature: string, timestamp?: string): WebhookEvent;
    generateTestSignature(payload: string): string;
    register(name: string, url: string, events: string[], options?: RequestOptions): Promise<WebhookResponse>;
    list(options?: RequestOptions): Promise<WebhooksListResponse>;
    update(id: number, data: UpdateWebhookData, options?: RequestOptions): Promise<WebhookResponse>;
    delete(id: number, options?: RequestOptions): Promise<DeleteResponse>;
}
//# sourceMappingURL=webhooks.d.ts.map