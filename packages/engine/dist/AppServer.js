"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppServer = void 0;
const http_1 = __importDefault(require("http"));
const logger_1 = require("./logger");
const logger = new logger_1.Logger('AppServer');
/**
 * Thin wrapper around Node's HTTP server created from a selected HttpAdapter.
 */
class AppServer {
    httpServer;
    constructor(httpServer) {
        this.httpServer = httpServer;
    }
    /** Create a server from a provided adapter. */
    static async create(httpAdapter) {
        const underlyingServer = httpAdapter.getServer
            ? httpAdapter.getServer()
            : http_1.default.createServer(httpAdapter.getHandler());
        return new AppServer(underlyingServer);
    }
    /** Access the underlying Node HTTP server instance. */
    getHttpServer() {
        return this.httpServer;
    }
    /** Start listening on a given port. */
    async start(port) {
        return new Promise((resolve, reject) => {
            this.httpServer.listen(port, () => {
                process.stdout.write('\n');
                logger.info(`🎧 HTTP server listening on port: ${port}`);
                resolve();
            });
            this.httpServer.on('error', (err) => reject(err));
        });
    }
    /** Gracefully stop the server. */
    async stop() {
        return new Promise((resolve, reject) => {
            this.httpServer.close((err) => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }
}
exports.AppServer = AppServer;
//# sourceMappingURL=AppServer.js.map