import { ApiRouterFn } from "@/core/routes";

import { ClientController } from "@/api/v1/clients";
import { ManagementController } from "@/api/v1/management";

export namespace VersionSwitchOne {
  export type Domains = ClientController.Domain | ManagementController.Domain;

  export type Routes =
    | ClientController.RouteMap
    | ManagementController.RouteMap;

  export const router: ApiRouterFn<Domains, Routes> = (apiRouter) => {
    const routeGateway = apiRouter.register({
      version: "v1",
    });

    ClientController.gateway(routeGateway);
    ManagementController.gateway(routeGateway);
  };
}
