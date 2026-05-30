import { HttpClient } from '../http.js';
import { WebhookVerifier } from '../../webhooks/verifier.js';
import { WebhookVerificationError } from '../../errors/index.js';
import type {
  WebhookResponse,
  WebhooksListResponse,
  UpdateWebhookData,
  DeleteResponse,
  RequestOptions,
} from '../../types/index.js';
import type { WebhookEvent } from '../../types/webhooks.js';

export class WebhooksResource {
  private verifier: WebhookVerifier;

  constructor(private httpClient: HttpClient, webhookSecret?: string) {
    this.verifier = new WebhookVerifier(webhookSecret || '');
  }

  verifySignature(payload: string, signature: string): boolean {
    return this.verifier.verify(payload, signature);
  }

  constructEvent(payload: string, signature: string, timestamp?: string): WebhookEvent {
    if (!this.verifier.verify(payload, signature)) {
      throw new WebhookVerificationError('Invalid webhook signature');
    }

    if (timestamp && !this.verifier.validateTimestamp(timestamp)) {
      throw new WebhookVerificationError('Webhook timestamp outside tolerance window');
    }

    try {
      const event = JSON.parse(payload);
      return event as WebhookEvent;
    } catch (_error) {
      throw new WebhookVerificationError('Failed to parse webhook payload');
    }
  }

  generateTestSignature(payload: string): string {
    return this.verifier.calculateSignature(payload);
  }

  async register(name: string, url: string, events: string[], options?: RequestOptions): Promise<WebhookResponse> {
    const { data: responseData, requestId } = await this.httpClient.request<any>({
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

  async list(options?: RequestOptions): Promise<WebhooksListResponse> {
    const { data: responseData, requestId } = await this.httpClient.request<any>({
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

  async update(id: number, data: UpdateWebhookData, options?: RequestOptions): Promise<WebhookResponse> {
    const { data: responseData, requestId } = await this.httpClient.request<any>({
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

  async delete(id: number, options?: RequestOptions): Promise<DeleteResponse> {
    const { data: responseData, requestId } = await this.httpClient.request<any>({
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
