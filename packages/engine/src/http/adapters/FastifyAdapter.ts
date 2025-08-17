import type { Server as HTTPServer, IncomingMessage, ServerResponse } from 'http';
import fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { HttpMethod } from '@nidio/toolkit';
import type {
  FrameworkHandler,
  FrameworkHttpMethod,
  HttpAdapter,
  FrameworkRequest,
  BuiltinAdapterOptions,
} from './HttpAdapter';
import { requestIdMiddleware } from '../../middlewares/requestId.middleware';
import { requestLogMiddleware } from '../../middlewares/requestLog.middleware';

/** @internal Fastify-based HttpAdapter (not exported publicly). */
export class FastifyAdapter implements HttpAdapter {
  private readonly fastifyInstance: FastifyInstance;
  private readonly options: BuiltinAdapterOptions;

  constructor(options?: BuiltinAdapterOptions) {
    this.options = options ?? {};
    this.fastifyInstance = fastify({ logger: false, ignoreTrailingSlash: true });
    this.installGlobalPluginsAndHooks();
  }

  public registerRoute(httpMethod: FrameworkHttpMethod, fullPath: string, handlerFn: FrameworkHandler): void {
    this.fastifyInstance.route({
      method: httpMethod.toUpperCase() as HttpMethod,
      url: fullPath,
      handler: (request: FastifyRequest, reply: FastifyReply): void => {
        const frameworkReq: FrameworkRequest = Object.assign(request.raw, {
          body: request.body,
          params: request.params as Record<string, string>,
          query: request.query as Record<string, unknown>,
          headers: request.headers as Record<string, string | string[] | undefined>,
          requestId: (request.raw as FrameworkRequest).requestId,
        });

        void handlerFn(frameworkReq, reply.raw);
      },
    });
  }

  public getServer(): HTTPServer {
    return this.fastifyInstance.server;
  }

  public getHandler(): FrameworkHandler {
    return async (req: IncomingMessage, res: ServerResponse) => {
      this.fastifyInstance.server.emit('request', req, res);
    };
  }

  public async ready(): Promise<void> {
    await this.fastifyInstance.ready();
  }

  /** Register here global plugins, hooks, CORS, etc. */
  private installGlobalPluginsAndHooks(): void {
    if (this.options.requestId) {
      this.fastifyInstance.addHook('onRequest', (req, reply, done) => {
        requestIdMiddleware(req.raw as IncomingMessage, reply.raw as ServerResponse, (err?) => done(err));
      });
    }

    if (this.options.requestLog) {
      this.fastifyInstance.addHook('onRequest', (req, reply, done) => {
        requestLogMiddleware(req.raw as IncomingMessage, reply.raw as ServerResponse, (err?) => done(err));
      });
    }
  }
}
