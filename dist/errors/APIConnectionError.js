import { PayNexusError } from './PayNexusError.js';
export class APIConnectionError extends PayNexusError {
    constructor(message = 'Unable to connect to PayNexus API', requestId) {
        super(message, 503, requestId);
        this.name = 'APIConnectionError';
        Object.setPrototypeOf(this, APIConnectionError.prototype);
    }
}
//# sourceMappingURL=APIConnectionError.js.map