import { generateIdempotencyKey } from '../src/utils/idempotency';
import { Logger } from '../src/utils/logger';
import { SDK_VERSION, DEFAULT_CONFIG, PAYMENT_STATUS, WEBHOOK_EVENTS, HTTP_HEADERS } from '../src/utils/constants';

describe('generateIdempotencyKey', () => {
  it('returns a string starting with idemp_', () => {
    const key = generateIdempotencyKey();
    expect(key).toMatch(/^idemp_/);
  });

  it('generates unique keys', () => {
    const keys = new Set(Array.from({ length: 100 }, () => generateIdempotencyKey()));
    expect(keys.size).toBe(100);
  });
});

describe('Logger', () => {
  let consoleSpy: {
    debug: jest.SpyInstance;
    info: jest.SpyInstance;
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
  };

  beforeEach(() => {
    consoleSpy = {
      debug: jest.spyOn(console, 'debug').mockImplementation(),
      info: jest.spyOn(console, 'info').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs at info level by default', () => {
    const logger = new Logger();
    logger.info('test message');
    expect(consoleSpy.info).toHaveBeenCalledWith('[PayNexus INFO] test message');
  });

  it('respects log level hierarchy', () => {
    const logger = new Logger('warn');
    logger.debug('debug msg');
    logger.info('info msg');
    logger.warn('warn msg');
    logger.error('error msg');

    expect(consoleSpy.debug).not.toHaveBeenCalled();
    expect(consoleSpy.info).not.toHaveBeenCalled();
    expect(consoleSpy.warn).toHaveBeenCalled();
    expect(consoleSpy.error).toHaveBeenCalled();
  });

  it('debug level logs everything', () => {
    const logger = new Logger('debug');
    logger.debug('d');
    logger.info('i');
    logger.warn('w');
    logger.error('e');

    expect(consoleSpy.debug).toHaveBeenCalled();
    expect(consoleSpy.info).toHaveBeenCalled();
    expect(consoleSpy.warn).toHaveBeenCalled();
    expect(consoleSpy.error).toHaveBeenCalled();
  });
});

describe('Constants', () => {
  it('SDK_VERSION is defined', () => {
    expect(SDK_VERSION).toBe('1.0.0');
  });

  it('DEFAULT_CONFIG has correct defaults', () => {
    expect(DEFAULT_CONFIG.baseUrl).toBe('https://paynexus.co.ke');
    expect(DEFAULT_CONFIG.currency).toBe('KES');
    expect(DEFAULT_CONFIG.timeout).toBe(30000);
    expect(DEFAULT_CONFIG.retries).toBe(2);
    expect(DEFAULT_CONFIG.logLevel).toBe('info');
    expect(DEFAULT_CONFIG.autoIdempotency).toBe(true);
    expect(DEFAULT_CONFIG.pollInterval).toBe(3000);
    expect(DEFAULT_CONFIG.pollTimeout).toBe(120000);
    expect(DEFAULT_CONFIG.webhookTolerance).toBe(300000);
  });

  it('PAYMENT_STATUS has all statuses', () => {
    expect(PAYMENT_STATUS.PENDING).toBe('pending');
    expect(PAYMENT_STATUS.COMPLETED).toBe('completed');
    expect(PAYMENT_STATUS.FAILED).toBe('failed');
    expect(PAYMENT_STATUS.TIMEOUT).toBe('timeout');
  });

  it('WEBHOOK_EVENTS has all events', () => {
    expect(WEBHOOK_EVENTS.PAYMENT_COMPLETED).toBe('payment.completed');
    expect(WEBHOOK_EVENTS.PAYMENT_FAILED).toBe('payment.failed');
  });

  it('HTTP_HEADERS has correct header names and value', () => {
    expect(HTTP_HEADERS.ACCEPT).toBe('Accept');
    expect(HTTP_HEADERS.CONTENT_TYPE).toBe('Content-Type');
    expect(HTTP_HEADERS.JSON).toBe('application/json');
  });
});
