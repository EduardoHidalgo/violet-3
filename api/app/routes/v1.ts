import { VersionRouteMainEntryFn } from "@/core/api/routes";
import { clientRoutes } from "../v1/clients";
import { managementRoutes } from "../v1/managment";

enum ClientRoute {
  getMany = "clients/",
  get = "clients/:clientId",
}

enum BobberRoute {
  getMany = "bobbers/",
  get = "bobbers/:clientId",
}

type DomainRoute = ClientRoute | BobberRoute;

enum Domains {
  clients = "clients",
  bobbers = "bobbers",
}

export const v1: VersionRouteMainEntryFn = (apiRouter) => {
  const routeGateway = apiRouter.register({ version: "v1" });

  clientRoutes(routeGateway);
  managementRoutes(routeGateway);
};
