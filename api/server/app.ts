import express from "express";
import { Server } from "node:http";

import { environment } from "@/server/environment";
import {
  corsMiddleware,
  environmentMiddleware,
  helmetMiddleware,
  morganMiddleware,
  parserMiddleware,
  rateLimitMiddleware,
  routesMiddleware,
} from "@/server/middlewares";

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

  init() {
    this.configure();
    this.start();
  }

  private configure() {
    // Environments always should be the first middleware called.
    environmentMiddleware();

    corsMiddleware(this.app);
    helmetMiddleware(this.app);
    rateLimitMiddleware(this.app);
    parserMiddleware(this.app);
    morganMiddleware(this.app);

    // Routing always should be the last middleware called.
    routesMiddleware(this.app);
  }

  private start() {
    this.server = this.app.listen(environment.server.PORT, () => {
      // TODO Replace with Logger
      console.log(`Running at http://localhost:${environment.server.PORT}`);
    });
  }
}
