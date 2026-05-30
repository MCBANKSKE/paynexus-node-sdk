export declare class WebhookVerifier {
    private secret;
    constructor(secret: string);
    verify(payload: string, signature: string): boolean;
    calculateSignature(payload: string): string;
    private timingSafeEqual;
    validateTimestamp(timestamp: string | null, toleranceMs?: number): boolean;
}
//# sourceMappingURL=verifier.d.ts.map