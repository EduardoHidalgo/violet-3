import { ApiRouter } from "@/core/routes/apiRouter";
import { RouteGateway } from "@/core/routes/routeGateway";
import { RouteNode, RouteNodeArgs } from "@/core/routes/routeNode";
import {
  ApiRouterFn,
  ApiVersion,
  ApiVersionEnum,
  MainRouterFn,
  RestVerb,
  RouteGatewayFn,
  RoutesMiddlewareFn,
  apiVersions,
} from "@/core/routes/types";

// Exports only relevant things for the rest of base code.
export {
  ApiRouter,
  ApiRouterFn,
  ApiVersion,
  ApiVersionEnum,
  MainRouterFn,
  RestVerb,
  RouteGateway,
  RouteGatewayFn,
  RouteNode,
  RouteNodeArgs,
  RoutesMiddlewareFn,
  apiVersions,
};
