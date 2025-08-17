import http from 'http';
import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import compress from 'compression';
import { requestLogMiddleware } from '../../middlewares/requestLog.middleware';
import type { HttpAdapter, FrameworkHandler, FrameworkHttpMethod, BuiltinAdapterOptions } from './HttpAdapter';
import { requestIdMiddleware } from '../../middlewares/requestId.middleware';

/** @internal Express-based HttpAdapter (not exported publicly). */
export class ExpressAdapter implements HttpAdapter {
  private readonly expressApp: Express;
  private readonly httpServer: http.Server;
  private readonly options: BuiltinAdapterOptions;

  constructor(options?: BuiltinAdapterOptions) {
    this.options = options ?? {};
    this.expressApp = express();
    this.setupGlobalMiddlewares();
    this.httpServer = http.createServer(this.expressApp);
  }

  public getHandler(): FrameworkHandler {
    return this.expressApp;
  }

  public getServer(): http.Server {
    return this.httpServer;
  }

  public registerRoute(method: FrameworkHttpMethod, path: string, handler: FrameworkHandler): void {
    this.expressApp[method](path, (req: Request, res: Response) => void handler(req, res));
  }

  private setupGlobalMiddlewares(): void {
    this.expressApp.disable('x-powered-by');
    this.expressApp.use(express.json());
    this.expressApp.use(express.urlencoded({ extended: true }));

    if (this.options.helmet) {
      const helmetOptions = typeof this.options.helmet === 'object' ? this.options.helmet : undefined;
      this.expressApp.use(helmet(helmetOptions));
    }

    if (this.options.compression) {
      const compressOpts = typeof this.options.compression === 'object' ? this.options.compression : undefined;
      this.expressApp.use(compress(compressOpts));
    }

    if (this.options.requestId) this.expressApp.use(requestIdMiddleware);
    if (this.options.requestLog) {
      this.expressApp.use(requestLogMiddleware);
    }
  }
}
