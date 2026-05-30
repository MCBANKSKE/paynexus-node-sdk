import {
  PayNexusError,
  AuthenticationError,
  ValidationError,
  RateLimitError,
  NotFoundError,
} from './errors/index.js';
import type { ApiResponse, RequestOptions } from './types.js';

const SDK_VERSION = '2.0.0';

export interface HttpClientConfig {
  baseUrl: string;
  secretKey: string;
  timeout: number;
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly secretKey: string;
  private readonly timeout: number;

  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.secretKey = config.secretKey;
    this.timeout = config.timeout;
  }

  async get<T>(path: string, params?: Record<string, string | number | undefined>, options?: RequestOptions): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path, params);
    return this.request<T>('GET', url, undefined, options);
  }

  async post<T>(path: string, body?: Record<string, unknown>, options?: RequestOptions): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path);
    return this.request<T>('POST', url, body, options);
  }

  async put<T>(path: string, body?: Record<string, unknown>, options?: RequestOptions): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path);
    return this.request<T>('PUT', url, body, options);
  }

  async delete<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path);
    return this.request<T>('DELETE', url, undefined, options);
  }

  private buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
    // Concatenate baseUrl + path so the base path (e.g. /api) is preserved
    const fullPath = this.baseUrl + path;
    const url = new URL(fullPath);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  private async request<T>(
    method: string,
    url: string,
    body?: Record<string, unknown>,
    options?: RequestOptions,
  ): Promise<ApiResponse<T>> {
    const timeout = options?.timeout ?? this.timeout;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    // Chain caller signal to our controller
    if (options?.signal) {
      if (options.signal.aborted) {
        controller.abort();
      } else {
        options.signal.addEventListener('abort', () => controller.abort(), { once: true });
      }
    }

    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-API-Key': this.secretKey,
        'User-Agent': `PayNexus-Node/${SDK_VERSION}`,
      };

      const init: RequestInit = {
        method,
        headers,
        signal: controller.signal,
      };

      if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        init.body = JSON.stringify(body);
      }

      const response = await fetch(url, init);
      const json = (await response.json()) as ApiResponse<T>;

      if (!response.ok) {
        this.throwForStatus(response.status, json);
      }

      return json;
    } catch (err) {
      if (err instanceof PayNexusError) throw err;
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new PayNexusError('Request timed out', 408, 'timeout');
      }
      throw new PayNexusError(
        `Request failed: ${err instanceof Error ? err.message : String(err)}`,
        undefined,
        'network_error',
      );
    } finally {
      clearTimeout(timer);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private throwForStatus(status: number, json: any): never {
    const message = json?.message ?? json?.error ?? 'Unknown API error';

    switch (status) {
      case 401:
        throw new AuthenticationError(message);
      case 404:
        throw new NotFoundError(message);
      case 422:
        throw new ValidationError(message, json?.errors);
      case 429:
        throw new RateLimitError(message);
      default:
        throw new PayNexusError(message, status);
    }
  }
}
