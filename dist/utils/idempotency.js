export function generateIdempotencyKey() {
    return 'idemp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
}
//# sourceMappingURL=idempotency.js.map