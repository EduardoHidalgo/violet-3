import { Logger } from "@/libs/logger";
import { RoutesMiddlewareFn } from "@/core/routes";

import { mainRouter } from "@/api/routes";

/** Middleware to load all routes. For the correct functioning of the routes and
 * the API, it is recommended to use the {@link ApiRouter} class, which are in
 * charge of configure the routes on the express server and manage them.
 */
export const routesMiddleware: RoutesMiddlewareFn = (app) => {
  mainRouter(app);

  Logger.notice("routesMiddleware configured");
};
