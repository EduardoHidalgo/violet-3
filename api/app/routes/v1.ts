import { RouteGateway, RouteVersionFn } from "@/core/routes";
import { ApiRouterType } from "@/middlewares";

import { clientRoutes, ClientDomain, ClientRoutes } from "@/api/v1/clients";
import {
  managementRoutes,
  ManagementDomain,
  ManagementRoutes,
} from "@/api/v1/management";

export type V1DomainUnionType = ClientDomain | ManagementDomain;
export type V1EndpointRouteUnionType = ClientRoutes | ManagementRoutes;

export type RouteGatewayType = RouteGateway<
  V1DomainUnionType,
  V1EndpointRouteUnionType
>;

export const v1: RouteVersionFn = (apiRouter: ApiRouterType) => {
  const routeGateway = apiRouter.register<
    V1DomainUnionType,
    V1EndpointRouteUnionType
  >({
    version: "v1",
  });

  clientRoutes(routeGateway);
  managementRoutes(routeGateway);
};
