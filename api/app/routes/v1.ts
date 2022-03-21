import { RouteVersionFn } from "@/core/routes";

import { clientRoutes, ClientDomain, ClientRoutes } from "@/api/v1/clients";
import {
  managementRoutes,
  ManagementDomain,
  ManagementRoutes,
} from "@/api/v1/management";

export type V1DomainUnionType = ClientDomain | ManagementDomain;
export type V1EndpointRouteUnionType = ClientRoutes | ManagementRoutes;

export const v1: RouteVersionFn<V1DomainUnionType, V1EndpointRouteUnionType> = (
  apiRouter
) => {
  const routeGateway = apiRouter.register({
    version: "v1",
  });

  clientRoutes(routeGateway);
  managementRoutes(routeGateway);
};
