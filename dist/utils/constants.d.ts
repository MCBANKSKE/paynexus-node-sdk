export declare const SDK_VERSION = "1.0.0";
export declare const DEFAULT_CONFIG: {
    readonly baseUrl: "https://paynexus.co.ke";
    readonly currency: "KES";
    readonly timeout: 30000;
    readonly retries: 2;
    readonly logLevel: "info";
    readonly autoIdempotency: true;
    readonly pollInterval: 3000;
    readonly pollTimeout: 120000;
    readonly webhookTolerance: 300000;
};
export declare const WEBHOOK_TOLERANCE = 300000;
export declare const HTTP_HEADERS: {
    readonly ACCEPT: "Accept";
    readonly CONTENT_TYPE: "Content-Type";
    readonly JSON: "application/json";
};
export declare const PAYMENT_STATUS: {
    readonly PENDING: "pending";
    readonly COMPLETED: "completed";
    readonly FAILED: "failed";
    readonly TIMEOUT: "timeout";
};
export declare const WEBHOOK_EVENTS: {
    readonly PAYMENT_COMPLETED: "payment.completed";
    readonly PAYMENT_FAILED: "payment.failed";
};
//# sourceMappingURL=constants.d.ts.map