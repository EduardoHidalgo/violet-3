import { RouteDomainFn } from "@/core/routes";
import { Result } from "@/core/result";
import { RouteGatewayType } from "@/routes/v1";

export type ManagementDomain = "management";
const domain: ManagementDomain = "management";

export enum ManagementRoutes {
  getMany = "management/",
  get = "management/:managementId",
}

export const managementRoutes: RouteDomainFn = (
  routeGateway: RouteGatewayType
) => {
  const routeNode = routeGateway.register<ManagementDomain, ManagementRoutes>(
    domain
  );

  routeNode.addEndpoint("get", ManagementRoutes.get, async () => {
    return new Result({ code: 200, isSuccess: true });
  });

  routeNode.addEndpoint("get", ManagementRoutes.getMany, async () => {
    return new Result({ code: 200, isSuccess: true });
  });
};
