import { RouteGateway, RouteVersionFn } from "@/core/routes";
import { ApiRouterType } from "@/middlewares";

import { clientRoutes, ClientDomain, ClientRoutes } from "@/api/v1/clients";
import {
  managementRoutes,
  ManagementDomain,
  ManagementRoutes,
} from "@/api/v1/management";

export type V2DomainUnionType = ClientDomain | ManagementDomain;
export type V2EndpointRouteUnionType = ClientRoutes | ManagementRoutes;

export type RouteGatewayType = RouteGateway<
  V2DomainUnionType,
  V2EndpointRouteUnionType
>;

export const v2: RouteVersionFn = (apiRouter: ApiRouterType) => {
  const routeGateway = apiRouter.register<
    V2DomainUnionType,
    V2EndpointRouteUnionType
  >({
    version: "v2",
  });

  clientRoutes(routeGateway);
  managementRoutes(routeGateway);
};
