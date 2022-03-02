import { Express } from "express";
import rateLimit from "express-rate-limit";

import { environment } from "@/server/environment";

/** Basic rate-limiting middleware for Express. Use to limit repeated requests
 * to public APIs and/or endpoints. It's important to notice that this
 * middleware doesn't share stare with other processes/servers by default,
 * meaning that if you deploy this server on any clustered or containerized
 * infrastructure, each node will have its own rate limit.
 */
export function rateLimitMiddleware(app: Express): void {
  app.use(
    rateLimit({
      // Limit each IP to "n" requests per window.
      max: environment.server.RATE_LIMIT_MAX_REQUESTS,
      // Minutes for limit restarting.
      windowMs: environment.server.RATE_LIMIT_WMS_MINUTES * 60 * 1000,
    })
  );
}
