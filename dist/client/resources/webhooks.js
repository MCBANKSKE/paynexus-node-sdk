import { WebhookVerifier } from '../../webhooks/verifier.js';
import { WebhookVerificationError } from '../../errors/index.js';
export class WebhooksResource {
    httpClient;
    verifier;
    constructor(httpClient, webhookSecret) {
        this.httpClient = httpClient;
        this.verifier = new WebhookVerifier(webhookSecret || '');
    }
    verifySignature(payload, signature) {
        return this.verifier.verify(payload, signature);
    }
    constructEvent(payload, signature, timestamp) {
        if (!this.verifier.verify(payload, signature)) {
            throw new WebhookVerificationError('Invalid webhook signature');
        }
        if (timestamp && !this.verifier.validateTimestamp(timestamp)) {
            throw new WebhookVerificationError('Webhook timestamp outside tolerance window');
        }
        try {
            const event = JSON.parse(payload);
            return event;
        }
        catch (_error) {
            throw new WebhookVerificationError('Failed to parse webhook payload');
        }
    }
    generateTestSignature(payload) {
        return this.verifier.calculateSignature(payload);
    }
    async register(name, url, events, options) {
        const { data: responseData, requestId } = await this.httpClient.request({
            method: 'POST',
            url: '/api/webhooks',
            data: {
                name,
                url,
                events,
            },
        }, options);
        return {
            success: responseData.success,
            data: responseData.data,
            message: responseData.message,
            requestId,
        };
    }
    async list(options) {
        const { data: responseData, requestId } = await this.httpClient.request({
            method: 'GET',
            url: '/api/webhooks',
        }, options);
        return {
            success: responseData.success,
            data: responseData.data,
            message: responseData.message,
            requestId,
        };
    }
    async update(id, data, options) {
        const { data: responseData, requestId } = await this.httpClient.request({
            method: 'PUT',
            url: `/api/webhooks/${id}`,
            data,
        }, options);
        return {
            success: responseData.success,
            data: responseData.data,
            message: responseData.message,
            requestId,
        };
    }
    async delete(id, options) {
        const { data: responseData, requestId } = await this.httpClient.request({
            method: 'DELETE',
            url: `/api/webhooks/${id}`,
        }, options);
        return {
            success: responseData.success,
            message: responseData.message,
            requestId,
        };
    }
}
//# sourceMappingURL=webhooks.js.map