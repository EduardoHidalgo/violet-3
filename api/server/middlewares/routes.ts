import { Logger } from "@/libs/logger";
import { ApiRouter, RoutesMiddlewareFn } from "@/core/routes";

import {
  v1,
  V1DomainUnionType,
  V1EndpointRouteUnionType,
} from "@/api/routes/v1";
import {
  v2,
  V2DomainUnionType,
  V2EndpointRouteUnionType,
} from "@/api/routes/v2";

export type DomainGlobalUnion = V1DomainUnionType | V2DomainUnionType;
export type RoutesGlobalUnion =
  | V1EndpointRouteUnionType
  | V2EndpointRouteUnionType;

export type ApiRouterType = ApiRouter<DomainGlobalUnion, RoutesGlobalUnion>;

/** Middleware to load all routes. For the correct functioning of the routes and
 * the API, it is recommended to use the {@link ApiRouter} class, which are in
 * charge of configure the routes on the express server and manage them.
 */
export const routesMiddleware: RoutesMiddlewareFn = (app) => {
  const apiRouter = new ApiRouter<DomainGlobalUnion, RoutesGlobalUnion>({
    app,
  });

  v1(apiRouter);
  v2(apiRouter);

  apiRouter.turnOn();

  Logger.notice("routesMiddleware configured");
};
