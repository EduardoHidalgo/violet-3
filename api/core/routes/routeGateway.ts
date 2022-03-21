import { Router } from "express";

import { ApiVersion } from "@/core/routes/types";
import { BaseApiRouter } from "@/core/routes/apiRouter";
import { HiddenRouteNode, RouteNode } from "@/core/routes/routeNode";

/** Arguments required when {@link BaseRouteGateway} class is instanciated. */
interface RouteGatewayArgs {
  scope: BaseApiRouter;
  basePath: string;
  isDuplicated: boolean;
  router: Router;
  version: ApiVersion;
}

export class BaseRouteGateway {
  nodes: Array<HiddenRouteNode>;
  router: Router;
  version: ApiVersion;

  scope: BaseApiRouter;
  basePath: string;
  domain!: string;
  isDuplicated: boolean;

  constructor(args: RouteGatewayArgs) {
    const { scope, basePath, isDuplicated, router, version } = args;

    this.scope = scope;
    this.basePath = basePath;
    this.isDuplicated = isDuplicated;
    this.router = router;
    this.version = version;

    this.nodes = [];
  }

  // TODO add comments
  register(domain: string): RouteNode {
    this.domain = domain;

    // Validate if this routeNode actually exists.
    const isDomainDuplicated = this.scope.hasDomainDuplicity(
      domain,
      this.version
    );

    const isDuplicated = this.isDuplicated
      ? this.isDuplicated
      : isDomainDuplicated;

    const node = new HiddenRouteNode({
      scope: this.scope,
      basePath: this.basePath,
      router: this.router,
      version: this.version,
      domain,
      isDuplicated,
    });

    this.nodes.push(node);

    return new RouteNode(node);
  }
}

export class RouteGateway {
  private routeGateway: BaseRouteGateway;

  constructor(routeGateway: BaseRouteGateway) {
    this.routeGateway = routeGateway;
  }

  register = (domain: string): RouteNode => this.routeGateway.register(domain);
}
