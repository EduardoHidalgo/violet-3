import { Express } from "express";

import { ApiRouter, RouteGateway } from "@/core/api/routes";

/** Type of function that should be used to define the main route middleware,
 * where all {@link RouteVersionFn} are invoked. This middleware should
 * be called by the ServerApp.
 */
export type RoutesMiddlewareFn = (app: Express) => void;

/** Type of function that should be used to define the route functions in
 * charge of declaring a new api version.
 */
export type RouteVersionFn = (apiRouter: ApiRouter) => void;

/** Type of function that should be used to define the route functions in
 * charge of declaring the endpoints of a particular domain.
 */
export type RouteDomainFn = (routeGateway: RouteGateway) => void;

// TODO add comments
export enum ApiVersionEnum {
  v1 = "v1",
  v2 = "v2",
  v3 = "v3",
  v4 = "v4",
  v5 = "v5",
  v6 = "v6",
  v7 = "v7",
  v8 = "v8",
  v9 = "v9",
}

export const apiVersions = Object.values(ApiVersionEnum);

export type ApiVersion = keyof typeof ApiVersionEnum;

// TODO add comments
export type RestVerb =
  | "all"
  | "delete"
  | "get"
  | "head"
  | "options"
  | "patch"
  | "post"
  | "put";
