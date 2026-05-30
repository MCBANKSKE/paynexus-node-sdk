type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export declare class Logger {
    private level;
    constructor(level?: LogLevel);
    private shouldLog;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
}
export {};
//# sourceMappingURL=logger.d.ts.map