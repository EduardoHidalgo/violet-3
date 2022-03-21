import { RouteVersionFn } from "@/core/api/routes";

import { clientRoutes } from "@/api/v1/clients";
import { managementRoutes } from "@/api/v1/managment";

enum ClientRoute {
  getMany = "clients/",
  get = "clients/:clientId",
}

enum BobberRoute {
  getMany = "bobbers/",
  get = "bobbers/:clientId",
}

// TODO integrate Domain typed inference on Routing
type DomainRoute = ClientRoute | BobberRoute;

enum Domains {
  clients = "clients",
  bobbers = "bobbers",
}

export const v1: RouteVersionFn = (apiRouter) => {
  const routeGateway = apiRouter.register({ version: "v1" });

  clientRoutes(routeGateway);
  managementRoutes(routeGateway);
};
