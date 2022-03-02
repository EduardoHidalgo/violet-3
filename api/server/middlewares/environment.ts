import { BaseError } from "@/core/error";
import { EnvManager, environment } from "@/server/environment";

/** Middleware for loading environment variables. This middleware should be the
 * first called on the app file.
 */
export function environmentMiddleware(): void {
  const result = EnvManager.validate();

  // TODO replace with Logger
  environment.server.LOG_ENVIRONMENT &&
    console.log("[SERVER] Environment: " + JSON.stringify(environment));

  if (result instanceof BaseError) throw result;
}
