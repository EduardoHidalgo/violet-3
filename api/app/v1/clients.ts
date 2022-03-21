import { Result } from "@/core/result";
import { RouteDomainFn } from "@/core/routes";

export type ClientDomain = "clients";
const domain: ClientDomain = "clients";

export enum ClientRoutes {
  getMany = "clients/",
  get = "clients/:clientId",
}

export const clientRoutes: RouteDomainFn<ClientDomain, ClientRoutes> = (
  routeGateway
) => {
  const routeNode = routeGateway.register(domain);

  routeNode.addEndpoint("get", ClientRoutes.get, async () => {
    return new Result({ code: 200, isSuccess: true });
  });

  routeNode.addEndpoint("get", ClientRoutes.getMany, async () => {
    return new Result({ code: 200, isSuccess: true });
  });
};
