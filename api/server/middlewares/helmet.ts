import { Express } from "express";
import helmet from "helmet";

import { Logger } from "@/libs/logger";

/** Helmet helps you to secure your Express apps by setting various HTTP
 * headers and CORS policies.
 */
export function helmetMiddleware(app: Express): void {
  app.use(helmet());

  Logger.notice("helmetMiddleware configured");
}
