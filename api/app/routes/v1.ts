import { MainVersionRouteEntryFn } from "@/core/api/routes";
import { testRoutes } from "../v1/route";

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

export const v1: MainVersionRouteEntryFn = (apiRouter) => {
  const routeGateway = apiRouter.register({ version: "v1" });

  testRoutes(routeGateway);
};
