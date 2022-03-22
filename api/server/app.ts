import express from "express";
import { Server } from "node:http";

import { environment } from "@/environment";
import {
  corsMiddleware,
  environmentMiddleware,
  errorMonitoringMiddleware,
  helmetMiddleware,
  monitoringMiddleware,
  morganMiddleware,
  parserMiddleware,
  rateLimitMiddleware,
  routesMiddleware,
} from "@/middlewares";
import { Logger } from "@/libs/logger";

/** Class in charge of starting the API server and calling all the middleware
 * required for the server configuration. It serves as the main gateway where
 * all other classes, services, and processes needed to run the server can be
 * instantiated.
 */
export class ServerApp {
  private app: express.Express;
  private server!: Server;

  constructor() {
    this.app = express();
  }

  async init() {
    // Probably some async configurations.
    await this.configure();

    this.start();
  }

  private async configure() {
    // Environments always should be the first middleware called.
    environmentMiddleware();

    corsMiddleware(this.app);
    helmetMiddleware(this.app);
    rateLimitMiddleware(this.app);
    parserMiddleware(this.app);
    morganMiddleware(this.app);
    monitoringMiddleware(this.app);

    // Routing always should be the penultimate middleware called.
    routesMiddleware(this.app);

    errorMonitoringMiddleware(this.app);
  }

  private start() {
    this.server = this.app.listen(environment.server.PORT, () => {
      Logger.notice(`Running at http://localhost:${environment.server.PORT}`);
    });
  }
}

export const serverApp = new ServerApp();
