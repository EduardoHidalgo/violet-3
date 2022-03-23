import { Router } from "express";

import { ApiVersion } from "@/core/routes/types";
import { AbstractApiRouter } from "@/core/routes/apiRouter";
import { AbstractRouteNode, RouteNode } from "@/core/routes/routeNode";

/** Arguments required when {@link AbstractRouteGateway} class is instanciated. */
interface RouteGatewayArgs {
  /** Reference to the parent BaseApiRouter instance. */
  scopeReference: AbstractApiRouter;
  /** Base route string. */
  basePath: string;
  /** Boolean that represent the duplicated state of some invalid endpoint. */
  isDuplicated: boolean;
  /** Express.js Router instance. */
  router: Router;
  /** API version which belongs. */
  version: ApiVersion;
}

/** Class in charge of managing the common routing branch (according to a
 * domain) for all the endpoints that belong to the same domain.
 */
export class RouteGateway<DomainUnion, RoutesUnion> {
  private routeGateway: AbstractRouteGateway;

  constructor(routeGateway: AbstractRouteGateway) {
    this.routeGateway = routeGateway;
  }

  /** Create a new RouteNode for endpoint registration from a common domain.
   *
   * @param domain Domain string.
   * @returns New RouteNode instance.
   */
  register = <Domain extends DomainUnion, Routes extends RoutesUnion>(
    domain: Domain
  ): RouteNode<Domain, Routes> => this.routeGateway.register(domain);
}

/** Parent abstract class of {@link RouteGateway} that provides the
 * implementations and exposes them to the other abstract classes.
 */
export class AbstractRouteGateway {
  basePath: string;
  domain!: string;
  isDuplicated: boolean;
  nodes: Array<AbstractRouteNode<unknown, unknown>>;
  router: Router;
  scopeReference: AbstractApiRouter;
  version: ApiVersion;

  constructor(args: RouteGatewayArgs) {
    const { scopeReference, basePath, isDuplicated, router, version } = args;

    this.scopeReference = scopeReference;
    this.basePath = basePath;
    this.isDuplicated = isDuplicated;
    this.router = router;
    this.version = version;

    this.nodes = [];
  }

  register<Domain, Routes>(domain: Domain): RouteNode<Domain, Routes> {
    this.domain = String(domain);

    // Validate if this routeNode actually exists.
    const isDomainDuplicated = this.scopeReference.hasDomainDuplicity(
      this.domain,
      this.version
    );

    const isDuplicated = this.isDuplicated
      ? this.isDuplicated
      : isDomainDuplicated;

    const node = new AbstractRouteNode<Domain, Routes>({
      scopeReference: this.scopeReference,
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
