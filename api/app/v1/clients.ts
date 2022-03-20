import { DomainRouteMainEntryFn } from "@/core/api/routes";
import { Result } from "@/core/result";

export const clientRoutes: DomainRouteMainEntryFn = (routeGateway) => {
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