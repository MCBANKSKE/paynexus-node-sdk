import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { SDK_VERSION, HTTP_HEADERS } from '../utils/constants.js';
import { Logger } from '../utils/logger.js';
import { APIConnectionError, AuthenticationError, ValidationError, RateLimitError } from '../errors/index.js';

export class HttpClient {
  private axiosInstance: AxiosInstance;
  private logger: Logger;
  private retries: number;
  private secretKey: string;
  private publicKey?: string;

  constructor(
    secretKey: string,
    baseUrl: string,
    timeout: number = 30000,
    retries: number = 2,
    logLevel: 'debug' | 'info' | 'warn' | 'error' = 'info',
    customAxios?: AxiosInstance,
    publicKey?: string
  ) {
    this.secretKey = secretKey;
    this.publicKey = publicKey;
    this.retries = retries;
    this.logger = new Logger(logLevel);

    if (customAxios) {
      this.axiosInstance = customAxios;
    } else {
      this.axiosInstance = axios.create({
        baseURL: baseUrl,
        timeout,
        headers: {
          [HTTP_HEADERS.ACCEPT]: HTTP_HEADERS.JSON,
          [HTTP_HEADERS.CONTENT_TYPE]: HTTP_HEADERS.JSON,
          'User-Agent': `PayNexus-Node/${SDK_VERSION}`,
          'X-PayNexus-SDK': 'node',
          'X-PayNexus-Version': SDK_VERSION,
        },
      });
    }

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add API key header
        const usePublicKey = (config as any).usePublicKey;
        const apiKey = usePublicKey && this.publicKey ? this.publicKey : this.secretKey;
        config.headers['X-API-Key'] = apiKey;

        // Generate request ID
        config.headers['X-Request-ID'] = this.generateRequestId();

        this.logger.debug(`Request: ${config.method?.toUpperCase()} ${config.url}`, {
          headers: config.headers,
        });

        return config;
      },
      (error) => {
        this.logger.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    this.axiosInstance.interceptors.response.use(
      (response) => {
        this.logger.debug(`Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        this.logger.error('Response error:', error.message);
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private handleError(error: any): Error {
    const requestId = error.config?.headers?.['X-Request-ID'];
    
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.data?.error || error.message;

      switch (status) {
        case 401:
          return new AuthenticationError(message, requestId);
        case 400:
          return new ValidationError(message, requestId);
        case 429:
          return new RateLimitError(message, requestId);
        default:
          return new Error(message);
      }
    } else if (error.request) {
      return new APIConnectionError('Unable to reach PayNexus API', requestId);
    } else {
      return new Error(error.message);
    }
  }

  async request<T>(
    config: AxiosRequestConfig,
    options?: { usePublicKey?: boolean; signal?: AbortSignal }
  ): Promise<{ data: T; requestId: string }> {
    const mergedConfig: AxiosRequestConfig & { usePublicKey?: boolean } = {
      ...config,
      usePublicKey: options?.usePublicKey,
      signal: options?.signal,
    } as AxiosRequestConfig & { usePublicKey?: boolean };

    let lastError: Error | null = null;
    let attempts = 0;
    const maxAttempts = this.retries + 1;

    while (attempts < maxAttempts) {
      attempts++;
      
      try {
        const response: AxiosResponse<T> = await this.axiosInstance.request(mergedConfig);
        const requestId = response.config.headers?.['X-Request-ID'] as string;
        
        return {
          data: response.data,
          requestId,
        };
      } catch (error) {
        lastError = error as Error;

        // Don't retry on authentication errors or abort errors
        if (error instanceof AuthenticationError || (error as Error).name === 'CanceledError') {
          throw error;
        }
        
        // Retry on network errors or 5xx errors
        if (attempts < maxAttempts && this.shouldRetry(error)) {
          this.logger.warn(`Retrying request (attempt ${attempts}/${maxAttempts})`);
          await this.delay(500 * attempts); // Exponential backoff
          continue;
        }
        
        throw lastError;
      }
    }

    throw lastError;
  }

  private shouldRetry(error: any): boolean {
    // Retry on network errors
    if (!error.response) {
      return true;
    }

    // Retry on 5xx errors
    const status = error.response.status;
    return status >= 500 && status < 600;
  }

  private delay(ms: number): Promise<void> {
    return new Promise<void>((resolve) => {
      const timer = globalThis.setTimeout(resolve, ms);
      if (typeof timer === 'object' && timer !== null && 'unref' in timer) {
        timer.unref();
      }
    });
  }

  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}
