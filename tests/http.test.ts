import axios from 'axios';
import { HttpClient } from '../src/client/http';
import { AuthenticationError } from '../src/errors/AuthenticationError';
import { ValidationError } from '../src/errors/ValidationError';
import { RateLimitError } from '../src/errors/RateLimitError';
import { APIConnectionError } from '../src/errors/APIConnectionError';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('HttpClient', () => {
  let mockAxiosInstance: any;

  beforeEach(() => {
    mockAxiosInstance = {
      request: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    };
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates an axios instance with correct config', () => {
    new HttpClient('sk_test', 'https://api.example.com', 5000, 1, 'error');

    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: 'https://api.example.com',
        timeout: 5000,
      })
    );
  });

  it('sets up request and response interceptors', () => {
    new HttpClient('sk_test', 'https://api.example.com');

    expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
    expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
  });

  it('makes a successful request', async () => {
    mockAxiosInstance.request.mockResolvedValueOnce({
      data: { success: true, data: { id: 1 } },
      config: { headers: { 'X-Request-ID': 'req_123' } },
    });

    const client = new HttpClient('sk_test', 'https://api.example.com');
    const result = await client.request({ method: 'GET', url: '/test' });

    expect(result.data).toEqual({ success: true, data: { id: 1 } });
    expect(result.requestId).toBe('req_123');
  });

  it('uses a custom axios instance when provided', () => {
    const customInstance = {
      request: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    } as any;

    new HttpClient('sk_test', 'https://api.example.com', 30000, 2, 'info', customInstance);

    // Should NOT call axios.create since a custom instance is provided
    expect(mockedAxios.create).not.toHaveBeenCalled();
  });

  it('exposes the underlying axios instance', () => {
    const client = new HttpClient('sk_test', 'https://api.example.com');
    expect(client.getAxiosInstance()).toBe(mockAxiosInstance);
  });
});
