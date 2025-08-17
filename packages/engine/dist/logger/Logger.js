"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const NidioLogger_1 = require("./NidioLogger");
const PinoLogger_1 = require("./PinoLogger");
const logger_utils_1 = require("./logger.utils");
/**
 * Logger facade:
 * - auto picks Pino (prod) or Nidio (dev) unless overridden
 * - wires async/sync writers for Nidio
 * - pre-binds methods to remove branches from the hot path
 */
class Logger {
    debug = () => { };
    info = () => { };
    http = () => { };
    warn = () => { };
    error = () => { };
    constructor(context, options) {
        const isProd = process.env.NODE_ENV === 'production';
        const impl = options?.impl ?? 'auto';
        const explicitFormat = options?.format;
        let implInstance;
        // Choose implementation
        if (impl === 'pino' || explicitFormat === 'json' || (impl === 'auto' && isProd)) {
            implInstance = new PinoLogger_1.PinoLogger(context, options);
        }
        else {
            const sync = options?.sync ?? process.env.LOG_SYNC === 'true';
            const io = sync
                ? { out: logger_utils_1.writers.syncOut, err: logger_utils_1.writers.syncErr }
                : { out: logger_utils_1.writers.asyncOut, err: logger_utils_1.writers.asyncErr };
            implInstance = new NidioLogger_1.NidioLogger(context, options, io);
        }
        // Pre-bind for O(1)
        this.debug = implInstance.debug.bind(implInstance);
        this.info = implInstance.info.bind(implInstance);
        this.http = implInstance.http.bind(implInstance);
        this.warn = implInstance.warn.bind(implInstance);
        this.error = implInstance.error.bind(implInstance);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map