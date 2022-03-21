import { RouteVersionFn } from "@/core/routes";

import { clientRoutes, ClientDomain, ClientRoutes } from "@/api/v1/clients";
import {
  managementRoutes,
  ManagementDomain,
  ManagementRoutes,
} from "@/api/v1/management";

export type V2DomainUnionType = ClientDomain | ManagementDomain;
export type V2EndpointRouteUnionType = ClientRoutes | ManagementRoutes;

export const v2: RouteVersionFn<V2DomainUnionType, V2EndpointRouteUnionType> = (
  apiRouter
) => {
  const routeGateway = apiRouter.register({
    version: "v2",
  });

  clientRoutes(routeGateway);
  managementRoutes(routeGateway);
};
