"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressAdapter = void 0;
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const requestLog_middleware_1 = require("../../middlewares/requestLog.middleware");
const requestId_middleware_1 = require("../../middlewares/requestId.middleware");
/** @internal Express-based HttpAdapter (not exported publicly). */
class ExpressAdapter {
    expressApp;
    httpServer;
    options;
    constructor(options) {
        this.options = options ?? {};
        this.expressApp = (0, express_1.default)();
        this.setupGlobalMiddlewares();
        this.httpServer = http_1.default.createServer(this.expressApp);
    }
    getHandler() {
        return this.expressApp;
    }
    getServer() {
        return this.httpServer;
    }
    registerRoute(method, path, handler) {
        this.expressApp[method](path, (req, res) => void handler(req, res));
    }
    setupGlobalMiddlewares() {
        this.expressApp.disable('x-powered-by');
        this.expressApp.use(express_1.default.json());
        this.expressApp.use(express_1.default.urlencoded({ extended: true }));
        if (this.options.helmet) {
            const helmetOptions = typeof this.options.helmet === 'object' ? this.options.helmet : undefined;
            this.expressApp.use((0, helmet_1.default)(helmetOptions));
        }
        if (this.options.compression) {
            const compressOpts = typeof this.options.compression === 'object' ? this.options.compression : undefined;
            this.expressApp.use((0, compression_1.default)(compressOpts));
        }
        if (this.options.requestId)
            this.expressApp.use(requestId_middleware_1.requestIdMiddleware);
        if (this.options.requestLog) {
            this.expressApp.use(requestLog_middleware_1.requestLogMiddleware);
        }
    }
}
exports.ExpressAdapter = ExpressAdapter;
//# sourceMappingURL=ExpressAdapter.js.map