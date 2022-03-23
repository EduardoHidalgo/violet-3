import { Result } from "@/core/result";
import { RouteGatewayFn } from "@/core/routes";

export namespace ManagementController {
  export type Domain = "management";
  const domain = "management";

  export enum RouteMap {
    getMany = "management/",
    get = "management/:managementId",
  }

  export const gateway: RouteGatewayFn<Domain, RouteMap> = (routeGateway) => {
    const routeNode = routeGateway.register(domain);

    routeNode.addEndpoint("get", RouteMap.get, async () => {
      return new Result({ code: 200, isSuccess: true });
    });

    routeNode.addEndpoint("get", RouteMap.getMany, async () => {
      return new Result({ code: 200, isSuccess: true });
    });
  };
}
