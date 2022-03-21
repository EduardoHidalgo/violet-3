import { ApiRouter } from "@/core/routes/apiRouter";
import { RouteGateway } from "@/core/routes/routeGateway";
import { RouteNode, RouteNodeArgs } from "@/core/routes/routeNode";
import {
  ApiVersion,
  ApiVersionEnum,
  RestVerb,
  RouteDomainFn,
  RouteVersionFn,
  RoutesMiddlewareFn,
  apiVersions,
} from "@/core/routes/types";

// Exports only relevant things for the rest of base code.
export {
  ApiRouter,
  ApiVersion,
  ApiVersionEnum,
  RestVerb,
  RouteDomainFn,
  RouteGateway,
  RouteNode,
  RouteNodeArgs,
  RouteVersionFn,
  RoutesMiddlewareFn,
  apiVersions,
};
