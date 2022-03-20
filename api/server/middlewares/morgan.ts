import { Express, Request, Response } from "express";
import morgan from "morgan";

import { environment } from "@/environment";
import { Logger } from "@/libs/logger";

/** Prevents logging health checks when server is deployed.
 */
function skipHealthChecks(req: Request, _: Response): boolean {
  return environment.infra.IS_DEPLOY && req.originalUrl == "/";
}

/** Use of custom logging to print in console morgan logs.
 *
 * @param log Log string.
 */
function writeLog(log: string): void {
  return Logger.info(log);
}

/** HTTP incoming request logger middleware for node.js.
 */
export function morganMiddleware(app: Express): void {
  const devRequest = "[API][REQ] [:date[clf]] :method :url";
  const devResponse =
    "[API][RES] [:date[clf]] :method :status :url [SPAN]:total-time ms";
  const localRequest = "[API][REQ] [:date[clf]] :method :url";
  const localResponse =
    "[API][RES] [:date[clf]] :method :status :url [SPAN]:total-time ms";
  const prodRequest =
    "[API][REQ] [:date[clf]] :method HTTP/:http-version :url [IP]:remote-addr [REF]:referrer [AGENT]:user-agent";
  const prodResponse =
    "[API][RES] [:date[clf]] :method :status HTTP/:http-version :url [SPAN]:total-time ms";
  const testingRequest = "[API][REQ] [:date[clf]] :method :url";
  const testingResponse =
    "[API][RES] [:date[clf]] :method :status :url [SPAN]:total-time ms";

  const requestOptions: morgan.Options<Request, Response> = {
    skip: skipHealthChecks,
    immediate: true,
    stream: {
      write: writeLog,
    },
  };

  const responseOptions: morgan.Options<Request, Response> = {
    skip: skipHealthChecks,
    stream: {
      write: writeLog,
    },
  };

  switch (environment.server.ENVIRONMENT) {
    case "local":
      app.use(morgan(localRequest, requestOptions));
      app.use(morgan(localResponse, responseOptions));
      break;
    case "production":
      app.use(morgan(prodRequest, requestOptions));
      app.use(morgan(prodResponse, responseOptions));
      break;
    case "testing":
      app.use(morgan(testingRequest, requestOptions));
      app.use(morgan(testingResponse, responseOptions));
      break;
    case "development":
    default:
      app.use(morgan(devRequest, requestOptions));
      app.use(morgan(devResponse, responseOptions));
      break;
  }

  Logger.notice("morganMiddleware configured");
}
