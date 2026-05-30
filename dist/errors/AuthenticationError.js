import { PayNexusError } from './PayNexusError.js';
export class AuthenticationError extends PayNexusError {
    constructor(message = 'Authentication failed', requestId) {
        super(message, 401, requestId);
        this.name = 'AuthenticationError';
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
}
//# sourceMappingURL=AuthenticationError.js.map