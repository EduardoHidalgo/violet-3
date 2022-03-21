import { RouteVersionFn } from "@/core/routes";

import { clientRoutes, ClientDomain, ClientRoutes } from "@/api/v1/clients";
import {
  managementRoutes,
  ManagementDomain,
  ManagementRoutes,
} from "@/api/v1/management";

export type DomainUnionType = ClientDomain | ManagementDomain;
export type EndpointRouteUnionType = ClientRoutes | ManagementRoutes;

export const v1: RouteVersionFn = (apiRouter) => {
  const routeGateway = apiRouter.register({
    version: "v1",
  });

  clientRoutes(routeGateway);
  managementRoutes(routeGateway);
};
