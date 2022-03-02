import { MainDomainRouteEntryFn } from "@/core/api/routes";
import { Result } from "@/core/result";

export const testRoutes: MainDomainRouteEntryFn = (routeGateway) => {
  const routeNode = routeGateway.register("test");

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
