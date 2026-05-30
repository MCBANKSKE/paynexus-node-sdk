import type { HttpClient } from '../http.js';
import type {
  ApiResponse,
  RegisterWebhookParams,
  RequestOptions,
  UpdateWebhookParams,
  Webhook,
} from '../types.js';

export class WebhooksResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Register a new webhook endpoint.
   *
   * Returns the webhook including its `secret` — store it securely, it is only
   * shown once.
   */
  async register(params: RegisterWebhookParams, options?: RequestOptions): Promise<ApiResponse<Webhook>> {
    return this.http.post<Webhook>('/webhooks/register', params as unknown as Record<string, unknown>, options);
  }

  /**
   * Update an existing webhook.
   */
  async update(id: number, params: UpdateWebhookParams, options?: RequestOptions): Promise<ApiResponse<Webhook>> {
    return this.http.put<Webhook>(`/webhooks/${id}`, params as unknown as Record<string, unknown>, options);
  }

  /**
   * Delete a webhook by its ID.
   */
  async delete(id: number, options?: RequestOptions): Promise<ApiResponse<void>> {
    return this.http.delete<void>(`/webhooks/${id}`, options);
  }

  /**
   * List all webhooks for the authenticated merchant.
   */
  async list(options?: RequestOptions): Promise<ApiResponse<Webhook[]>> {
    return this.http.get<Webhook[]>('/webhooks', undefined, options);
  }
}
