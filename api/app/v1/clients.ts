import { RouteDomainFn } from "@/core/routes";
import { Result } from "@/core/result";

export type ClientDomain = "clients";

export enum ClientRoutes {
  getMany = "clients/",
  get = "clients/:clientId",
}

export const clientRoutes: RouteDomainFn = (routeGateway) => {
  const routeNode = routeGateway.register("clients");

  routeNode.addEndpoint("get", "tests", async () => {
    return new Result({ code: 200, isSuccess: true });
  });

  routeNode.addEndpoint("post", "tests", async () => {
    return new Result({ code: 200, isSuccess: true });
  });

  routeNode.addEndpoint("put", "tests", async () => {
    return new Result({ code: 200, isSuccess: true });
  });

  routeNode.addEndpoint("put", "tests", async () => {
    return new Result({ code: 200, isSuccess: true });
  });

  routeNode.addEndpoint("put", "testsss", async () => {
    return new Result({ code: 200, isSuccess: true });
  });

  routeNode.addEndpoint("put", "testsxxxx", async () => {
    return new Result({ code: 200, isSuccess: true });
  });
};
