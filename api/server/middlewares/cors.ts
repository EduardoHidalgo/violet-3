import { Express } from "express";
import cors from "cors";

import { Logger } from "@/libs/logger";

/** Base configuration for CORS. Cross-Origin Resource Sharing (CORS) is an
 * HTTP-header based mechanism that allows a server to indicate any origins
 * (domain, scheme, or port) other than its own from which a browser should
 * permit loading resources.
 */
export function corsMiddleware(app: Express): void {
  app.use(cors());

  Logger.notice("corsMiddleware configured");
}
