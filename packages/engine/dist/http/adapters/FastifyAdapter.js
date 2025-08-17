"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FastifyAdapter = void 0;
const fastify_1 = __importDefault(require("fastify"));
const requestId_middleware_1 = require("../../middlewares/requestId.middleware");
const requestLog_middleware_1 = require("../../middlewares/requestLog.middleware");
/** @internal Fastify-based HttpAdapter (not exported publicly). */
class FastifyAdapter {
    fastifyInstance;
    options;
    constructor(options) {
        this.options = options ?? {};
        this.fastifyInstance = (0, fastify_1.default)({ logger: false, ignoreTrailingSlash: true });
        this.installGlobalPluginsAndHooks();
    }
    registerRoute(httpMethod, fullPath, handlerFn) {
        this.fastifyInstance.route({
            method: httpMethod.toUpperCase(),
            url: fullPath,
            handler: (request, reply) => {
                const frameworkReq = Object.assign(request.raw, {
                    body: request.body,
                    params: request.params,
                    query: request.query,
                    headers: request.headers,
                    requestId: request.raw.requestId,
                });
                void handlerFn(frameworkReq, reply.raw);
            },
        });
    }
    getServer() {
        return this.fastifyInstance.server;
    }
    getHandler() {
        return async (req, res) => {
            this.fastifyInstance.server.emit('request', req, res);
        };
    }
    async ready() {
        await this.fastifyInstance.ready();
    }
    /** Register here global plugins, hooks, CORS, etc. */
    installGlobalPluginsAndHooks() {
        if (this.options.requestId) {
            this.fastifyInstance.addHook('onRequest', (req, reply, done) => {
                (0, requestId_middleware_1.requestIdMiddleware)(req.raw, reply.raw, (err) => done(err));
            });
        }
        if (this.options.requestLog) {
            this.fastifyInstance.addHook('onRequest', (req, reply, done) => {
                (0, requestLog_middleware_1.requestLogMiddleware)(req.raw, reply.raw, (err) => done(err));
            });
        }
    }
}
exports.FastifyAdapter = FastifyAdapter;
//# sourceMappingURL=FastifyAdapter.js.map