export class Logger {
    level;
    constructor(level = 'info') {
        this.level = level;
    }
    shouldLog(level) {
        const levels = ['debug', 'info', 'warn', 'error'];
        return levels.indexOf(level) >= levels.indexOf(this.level);
    }
    debug(message, ...args) {
        if (this.shouldLog('debug')) {
            console.debug(`[PayNexus DEBUG] ${message}`, ...args);
        }
    }
    info(message, ...args) {
        if (this.shouldLog('info')) {
            console.info(`[PayNexus INFO] ${message}`, ...args);
        }
    }
    warn(message, ...args) {
        if (this.shouldLog('warn')) {
            console.warn(`[PayNexus WARN] ${message}`, ...args);
        }
    }
    error(message, ...args) {
        if (this.shouldLog('error')) {
            console.error(`[PayNexus ERROR] ${message}`, ...args);
        }
    }
}
//# sourceMappingURL=logger.js.map