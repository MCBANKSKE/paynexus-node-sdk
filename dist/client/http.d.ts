import { type AxiosInstance, type AxiosRequestConfig } from 'axios';
export declare class HttpClient {
    private axiosInstance;
    private logger;
    private retries;
    private secretKey;
    private publicKey?;
    constructor(secretKey: string, baseUrl: string, timeout?: number, retries?: number, logLevel?: 'debug' | 'info' | 'warn' | 'error', customAxios?: AxiosInstance, publicKey?: string);
    private setupInterceptors;
    private generateRequestId;
    private handleError;
    request<T>(config: AxiosRequestConfig, options?: {
        usePublicKey?: boolean;
        signal?: AbortSignal;
    }): Promise<{
        data: T;
        requestId: string;
    }>;
    private shouldRetry;
    private delay;
    getAxiosInstance(): AxiosInstance;
}
//# sourceMappingURL=http.d.ts.map