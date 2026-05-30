import { PayNexusError } from './PayNexusError.js';
export class ValidationError extends PayNexusError {
    constructor(message = 'Validation failed', requestId) {
        super(message, 400, requestId);
        this.name = 'ValidationError';
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
//# sourceMappingURL=ValidationError.js.map