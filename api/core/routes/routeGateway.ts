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
  nodes: Array<HiddenRouteNode<unknown, unknown>>;
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
  register<Domain, Routes>(domain: string): RouteNode<Domain, Routes> {
    this.domain = domain;

    // Validate if this routeNode actually exists.
    const isDomainDuplicated = this.scope.hasDomainDuplicity(
      domain,
      this.version
    );

    const isDuplicated = this.isDuplicated
      ? this.isDuplicated
      : isDomainDuplicated;

    const node = new HiddenRouteNode<Domain, Routes>({
      scope: this.scope,
      basePath: this.basePath,
      router: this.router,
      version: this.version,
      domain: domain as unknown as Domain,
      isDuplicated,
    });

    this.nodes.push(node);

    return new RouteNode<Domain, Routes>(node);
  }
}

export class RouteGateway<DomainUnion, RoutesUnion> {
  private routeGateway: BaseRouteGateway;

  constructor(routeGateway: BaseRouteGateway) {
    this.routeGateway = routeGateway;
  }

  register = <Domain extends DomainUnion, Routes extends RoutesUnion>(
    domain: string
  ): RouteNode<Domain, Routes> => this.routeGateway.register(domain);
}
