import type { HttpClient } from '../http.js';
import type {
  ApiKey,
  ApiResponse,
  CreateApiKeyParams,
  RequestOptions,
  UpdateApiKeyParams,
} from '../types.js';

export class ApiKeysResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Create a new API key.
   *
   * The response includes the plain-text key — store it securely, it is only
   * shown once.
   */
  async create(params: CreateApiKeyParams, options?: RequestOptions): Promise<ApiResponse<ApiKey>> {
    return this.http.post<ApiKey>('/api-keys', params as unknown as Record<string, unknown>, options);
  }

  /**
   * List all API keys for the authenticated merchant.
   */
  async list(options?: RequestOptions): Promise<ApiResponse<ApiKey[]>> {
    return this.http.get<ApiKey[]>('/api-keys', undefined, options);
  }

  /**
   * Update an API key's name, permissions, IP/domain restrictions, status, or expiry.
   */
  async update(id: number, params: UpdateApiKeyParams, options?: RequestOptions): Promise<ApiResponse<ApiKey>> {
    return this.http.put<ApiKey>(`/api-keys/${id}`, params as unknown as Record<string, unknown>, options);
  }

  /**
   * Permanently delete an API key.
   */
  async delete(id: number, options?: RequestOptions): Promise<ApiResponse<void>> {
    return this.http.delete<void>(`/api-keys/${id}`, options);
  }
}
