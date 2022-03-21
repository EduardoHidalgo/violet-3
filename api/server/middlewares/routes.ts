import { Logger } from "@/libs/logger";
import { ApiRouter, RoutesMiddlewareFn } from "@/core/routes";

import { v1 } from "@/api/routes/v1";

/** Middleware to load all routes. For the correct functioning of the routes and
 * the API, it is recommended to use the {@link ApiRouter} class, which is in
 * charge of configuring the routes on the express server and managing them.
 */
export const routesMiddleware: RoutesMiddlewareFn = (app) => {
  const apiRouter = new ApiRouter({ app });

  v1(apiRouter);

  apiRouter.turnOn();

  Logger.notice("routesMiddleware configured");
};
