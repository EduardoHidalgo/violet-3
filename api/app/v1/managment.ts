import { RouteDomainFn } from "@/core/routes";
import { Result } from "@/core/result";

export const managementRoutes: RouteDomainFn = (routeGateway) => {
  const routeNode = routeGateway.register("management");

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
