"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PinoLogger = void 0;
const pino_1 = __importStar(require("pino"));
/**
 * Structured JSON logger for production. Async (sonic-boom) by default.
 * `http()` is mapped to `info()` so access logs appear at default level.
 */
class PinoLogger {
    log;
    constructor(context, options) {
        const level = options?.level ?? process.env.LOG_LEVEL ?? 'info';
        const sync = options?.sync ?? process.env.LOG_SYNC === 'true';
        const jsonTime = options?.jsonTime ?? 'epoch';
        const dest = pino_1.default.destination({ sync });
        const base = (0, pino_1.default)({
            level,
            timestamp: jsonTime === 'iso' ? pino_1.stdTimeFunctions.isoTime : pino_1.stdTimeFunctions.epochTime,
            formatters: {
                level(label, number) {
                    return { level: number, levelName: label };
                },
            },
        }, dest);
        this.log = context && context.length ? base.child({ ctx: context }) : base;
    }
    debug(m) {
        this.log.debug(m);
    }
    info(m) {
        this.log.info(m);
    }
    http(m) {
        this.log.info(m);
    }
    warn(m) {
        this.log.warn(m);
    }
    error(e) {
        if (e instanceof Error)
            this.log.error(e);
        else
            this.log.error(String(e));
    }
}
exports.PinoLogger = PinoLogger;
//# sourceMappingURL=PinoLogger.js.map