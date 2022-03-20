import { BaseError } from "@/core/error";
import { EnvManager, environment } from "@/environment";
import { Logger } from "@/libs/logger";

/** Middleware for loading environment variables. This middleware should be the
 * first called on the app file.
 */
export function environmentMiddleware(): void {
  const result = EnvManager.validate();

  environment.server.LOG_ENVIRONMENT &&
    Logger.notice("Environment: " + JSON.stringify(environment));

  if (result instanceof BaseError) throw result;

  Logger.notice("environmentMiddleware configured");
}
