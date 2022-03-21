import { Express, Router } from "express";

import { environment } from "@/environment";
import { Logger } from "@/libs/logger";

import { ApiVersion, RestVerb } from "@/core/api/routes/types";
import { BaseRouteGateway, RouteGateway } from "@/core/api/routes/routeGateway";
import { HiddenRouteNode } from "@/core/api/routes/routeNode";
import { RouteError } from "@/core/api/routes/errors";
import { RouteLogger } from "@/core/api/routes/routeLogger";

// TODO add environment variable for logs + add logs

/** Arguments required when {@link BaseApiRouter} class is instanciated. */
interface ApiRouterArgs {
  app: Express;
}

/** Main class responsible for the creation, management and configuration of API
 * routes. His main responsibility is to ensure that all defined endpoint paths 
 * comply with the RESTful architecture principle, and comply with the Violet 
 * architecture principles. As a secondary feature, it automates many API route 
 * implementations and configurations, saving a lot of boilerplate code, which 
 * is replaced by more verbose, readable, and declarative code. Finally it 
 * provides its own internal method to log the tree of registered endpoints.

Endpoints in Violet consist of the following components: "Version" of the API, 
"Domain" they belong to, "Verb" of the endpoint, and "path" of the endpoint.

- Prevents accidentally declaring two endpoints whose components are identical.
- Prevents declaring two equal API versions.
- Prevents declaring two equal Domains.
- Only allows certain specific verbs.
- Automates the implementation of aspects of the Violet architecture such as 
  authentication type, middleware chaining, type inference in route Request and 
  Response objects, etc.
 */
export class BaseApiRouter {
  scope: BaseApiRouter;
  app: Express;
  basePath: string;
  gateways: Array<BaseRouteGateway>;
  baseNodes: Array<HiddenRouteNode>;

  constructor(args: ApiRouterArgs) {
    const { app } = args;

    this.scope = this;
    this.app = app;
    this.gateways = [];
    this.baseNodes = [];

    this.basePath = environment.api.BASE_URI;

    const router = Router();
    this.addBaseEndpoints(router);
  }

  /** Create a new {@link RouteGateway} where domains related to a particular
   * API version can be registered.
   *
   * @returns the RouteGateway instance, required by
   * {@link RouteDomainFn} function.
   */
  register(args: { version: ApiVersion }): RouteGateway {
    const { version } = args;

    // Check if this version doesn't exists already.
    const isDuplicated = this.scope.hasVersionDuplicity(version);

    const router = Router();

    const gateway = new BaseRouteGateway({
      scope: this.scope,
      basePath: this.basePath,
      isDuplicated: isDuplicated,
      router,
      version,
    });

    this.gateways.push(gateway);

    // Each time a new API version is created, should be added base endpoints
    // related to this version.
    this.addGatewayBaseEndpoints(router, version);

    return new RouteGateway(gateway);
  }

  /** Consume all {@link RouteGateway}'s and apply Express.Router instances on
   * top of the Express app.
   */
  turnOn() {
    for (const gateway of this.gateways) {
      try {
        this.app.use(gateway.router);

        // Log all registered endpoints successfully.
        RouteLogger.log(this.baseNodes, this.gateways);
      } catch (error) {
        Logger.emergency(new RouteError.TurningOnGatewayFailure(error));
      }
    }
  }

  /** Creates base endpoints used for health checks through third-party
   * monitoring systems.
   *
   * @param router Express Router instance.
   * @param version API Version used.
   */
  addBaseEndpoints(router: Router) {
    const node = new HiddenRouteNode({
      scope: this.scope,
      basePath: this.basePath,
      isDuplicated: false,
      router,
    });

    node.addBaseEndpoint("/");
    node.addBaseEndpoint(`${this.basePath}`);

    this.baseNodes.push(node);
  }

  /** Creates base endpoints used for health checks through third-party
   * monitoring systems.
   *
   * @param router Express Router instance.
   * @param version API Version used.
   */
  addGatewayBaseEndpoints(router: Router, version: ApiVersion): void {
    const node = new HiddenRouteNode({
      scope: this.scope,
      basePath: this.basePath,
      isDuplicated: false,
      router,
      version,
    });

    node.addBaseEndpoint(`${this.basePath}/${version}`);
    node.addMonitoringEndpoint(`${this.basePath}/${version}/debug-monitoring`);

    this.baseNodes.push(node);
  }

  /** Validates that the version you want to use to create a new
   * {@link RouteGateway} does not currently exist.
   *
   * @returns true if already exists
   */
  hasVersionDuplicity(version: ApiVersion): boolean {
    for (const gateway of this.gateways) {
      if (gateway.version == version) {
        Logger.warning(new RouteError.DuplicatedVersionException(version));

        return true;
      }
    }

    return false;
  }

  /** Validates that the version and domain you want to use to create a new
   * {@link RouteNode} does not currently exist.
   *
   * @returns true if already exists.
   */
  hasDomainDuplicity(domain: string, version: ApiVersion): boolean {
    const gateway = this.gateways.find((g) => g.version == version);

    if (gateway == undefined) {
      Logger.warning(new RouteError.VersionDoesntExistsFailure(version));

      return true;
    }

    for (const node of gateway.nodes) {
      if (node.domain == domain) {
        Logger.warning(new RouteError.DuplicatedVersionException(version));

        return true;
      }
    }

    return false;
  }

  /** Validates that the domain, uri, verb and version you want to use to create
   * a new {@link RouteEndpoint} that does not currently exist.
   *
   * @returns true if already exists.
   */
  hasUriDuplicity(args: {
    domain?: string;
    uri: string;
    verb: RestVerb;
    version?: ApiVersion;
  }): boolean {
    const { domain, uri, verb, version } = args;

    // Has no version or domain means this is a base endpoint.
    if (version === undefined || domain === undefined)
      return this.checkBaseEndpointDuplicity(uri, verb);

    return this.checkCommonEndpointDuplicity(domain, uri, verb, version);
  }

  // TODO add comments
  private checkBaseEndpointDuplicity(uri: string, verb: RestVerb): boolean {
    for (const node of this.scope.baseNodes) {
      for (const endpoint of node.endpoints) {
        // If this endpoint has the same uri and verb, means already exists.
        if (endpoint.uri == uri && endpoint.verb == verb) {
          Logger.warning(new RouteError.DuplicatedEndpointException(uri, verb));

          return true;
        }
      }
    }

    return false;
  }

  // TODO add comments
  private checkCommonEndpointDuplicity(
    domain: string,
    uri: string,
    verb: RestVerb,
    version: ApiVersion
  ): boolean {
    const gateway = this.gateways.find((g) => g.version == version);
    if (gateway == undefined) {
      const exception = new RouteError.VersionDoesntExistsFailure(version);
      Logger.warning(exception);

      return true;
    }

    const node = gateway.nodes.find((n) => n.domain == domain);
    if (node == undefined) {
      const exception = new RouteError.DomainDoesntExistsFailure(domain);
      Logger.warning(exception);

      return true;
    }

    for (const node of gateway.nodes) {
      for (const endpoint of node.endpoints) {
        if (
          endpoint.uri == uri &&
          endpoint.verb == verb &&
          node.domain == domain
        ) {
          const exception = new RouteError.DuplicatedEndpointException(
            uri,
            verb
          );
          Logger.warning(exception);

          return true;
        }
      }
    }

    return false;
  }
}

/** Main class responsible for the creation, management and configuration of API
 * routes. His main responsibility is to ensure that all defined endpoint paths 
 * comply with the RESTful architecture principle, and comply with the Violet 
 * architecture principles. As a secondary feature, it automates many API route 
 * implementations and configurations, saving a lot of boilerplate code, which 
 * is replaced by more verbose, readable, and declarative code. Finally it 
 * provides its own internal method to log the tree of registered endpoints.

Endpoints in Violet consist of the following components: "Version" of the API, 
"Domain" they belong to, "Verb" of the endpoint, and "path" of the endpoint.

- Prevents accidentally declaring two endpoints whose components are identical.
- Prevents declaring two equal API versions.
- Prevents declaring two equal Domains.
- Only allows certain specific verbs.
- Automates the implementation of aspects of the Violet architecture such as 
  authentication type, middleware chaining, type inference in route Request and 
  Response objects, etc.
 */
export class ApiRouter {
  private apiRouter: BaseApiRouter;

  constructor(args: ApiRouterArgs) {
    this.apiRouter = new BaseApiRouter(args);
  }

  /** Create a new {@link RouteGateway} where domains related to a particular
   * API version can be registered.
   *
   * @returns the RouteGateway instance, required by
   * {@link RouteDomainFn} function.
   */
  register = (args: { version: ApiVersion }): RouteGateway =>
    this.apiRouter.register(args);

  /** Consume all {@link RouteGateway}'s and apply Express.Router instances on
   * top of the Express app.
   */
  turnOn = () => this.apiRouter.turnOn();
}
