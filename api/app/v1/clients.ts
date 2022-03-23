import { Result } from "@/core/result";
import { RouteGatewayFn } from "@/core/routes";

export namespace ClientController {
  export type Domain = "clients";

  export enum RouteMap {
    getMany = "clients/",
    get = "clients/:clientId",
  }

  export const gateway: RouteGatewayFn<Domain, RouteMap> = (routeGateway) => {
    const routeNode = routeGateway.register("clients");

    routeNode.addEndpoint("get", RouteMap.get, async () => {
      return new Result({ code: 200, isSuccess: true });
    });

    routeNode.addEndpoint("get", RouteMap.getMany, async () => {
      return new Result({ code: 200, isSuccess: true });
    });
  };
}
