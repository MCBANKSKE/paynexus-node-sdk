import { PayNexusError } from './PayNexusError.js';
export class RateLimitError extends PayNexusError {
    constructor(message = 'Rate limit exceeded', requestId) {
        super(message, 429, requestId);
        this.name = 'RateLimitError';
        Object.setPrototypeOf(this, RateLimitError.prototype);
    }
}
//# sourceMappingURL=RateLimitError.js.map