import { ApiRouter, RoutesMiddlewareFn } from "@/core/api/routes";
import { v1 } from "@/api/routes/v1";

/** Middleware for loading all routes
 */
export const routesMiddleware: RoutesMiddlewareFn = (app) => {
  const apiRouter = new ApiRouter({ app });

  v1(apiRouter);

  apiRouter.turnOn();
};
