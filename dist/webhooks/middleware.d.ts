import { Request, Response, NextFunction } from 'express';
import type { PayNexusClient } from '../client/PayNexusClient.js';
export interface WebhookMiddlewareOptions {
    secret: string;
    client?: PayNexusClient;
}
export declare function createWebhookMiddleware(options: WebhookMiddlewareOptions): (req: Request, res: Response, _next: NextFunction) => Promise<void>;
//# sourceMappingURL=middleware.d.ts.map