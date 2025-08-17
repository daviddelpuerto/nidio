import http, { Server as HTTPServer } from 'http';
import type { HttpAdapter } from './http/adapters/HttpAdapter';
import { Logger } from './logger';

const logger = new Logger('AppServer');

/**
 * Thin wrapper around Node's HTTP server created from a selected HttpAdapter.
 */
export class AppServer {
  private constructor(private readonly httpServer: HTTPServer) {}

  /** Create a server from a provided adapter. */
  static async create(httpAdapter: HttpAdapter): Promise<AppServer> {
    const underlyingServer: HTTPServer = httpAdapter.getServer
      ? httpAdapter.getServer()
      : http.createServer(httpAdapter.getHandler());

    return new AppServer(underlyingServer);
  }

  /** Access the underlying Node HTTP server instance. */
  public getHttpServer(): HTTPServer {
    return this.httpServer;
  }

  /** Start listening on a given port. */
  public async start(port: number): Promise<void> {
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
  public async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.httpServer.close((err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}
