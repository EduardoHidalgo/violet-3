import { RouteDomainFn } from "@/core/routes";
import { Result } from "@/core/result";
import { RouteGatewayType } from "@/routes/v1";

export type ClientDomain = "clients";
const domain: ClientDomain = "clients";

export enum ClientRoutes {
  getMany = "clients/",
  get = "clients/:clientId",
}

export const clientRoutes: RouteDomainFn = (routeGateway: RouteGatewayType) => {
  const routeNode = routeGateway.register<ClientDomain, ClientRoutes>(domain);

  routeNode.addEndpoint("get", ClientRoutes.get, async () => {
    return new Result({ code: 200, isSuccess: true });
  });

  routeNode.addEndpoint("get", ClientRoutes.getMany, async () => {
    return new Result({ code: 200, isSuccess: true });
  });
};
