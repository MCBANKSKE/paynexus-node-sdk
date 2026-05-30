export class PayNexusError extends Error {
    statusCode;
    requestId;
    constructor(message, statusCode, requestId) {
        super(message);
        this.statusCode = statusCode;
        this.requestId = requestId;
        this.name = 'PayNexusError';
        Object.setPrototypeOf(this, PayNexusError.prototype);
    }
}
//# sourceMappingURL=PayNexusError.js.map