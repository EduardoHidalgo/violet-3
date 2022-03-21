import { Request, Response, Router } from "express";

import { environment } from "@/environment";
import { Logger } from "@/libs/logger";
import { Empty, ResponseBase } from "@/core/api/api";
import { ServerErrorCode } from "@/core/error";
import { Result } from "@/core/index";

import { AbstractApiRouter } from "@/core/routes/apiRouter";
import { RouteError } from "@/core/routes/errors";
import { ApiVersion, RestVerb } from "@/core/routes/types";

const PING_MESSAGE = `[API Online] Target: ${environment.server.ENVIRONMENT}`;

/** Generic typing to infer the type of response from endpoints.
 */
type ModuleOperation = <Req, Dto>(
  req: Req,
  res: ResponseBase<Dto>
) => Promise<Result<Dto>>;

/** Additional arguments that can be passed through the {@link ProxyRouteNode}
 * when the register function is called, to customize the behavior of the
 * endpoint.
 */
interface ProxyRouterArgs {}

/** Interface that models the information that is persisted from registered
 * endpoints.
 */
export interface RouteEndpoint<Routes> {
  uri: Routes;
  verb: RestVerb;
}

/** Arguments required when {@link ProxyRouteNode} class is instanciated.
 */
export interface RouteNodeArgs<Domain> {
  basePath: string;
  isDuplicated: boolean;
  router: Router;
  scopeReference: AbstractApiRouter;
  domain?: Domain;
  version?: ApiVersion;
}

/** Class in charge of managing the creation of endpoints complying with the
 * necessary RESTful rules and providing all the secondary implementations and
 * middlewares.
 */
export class RouteNode<Domain, Routes> {
  private routeNode: AbstractRouteNode<Domain, Routes>;

  constructor(routeNode: AbstractRouteNode<Domain, Routes>) {
    this.routeNode = routeNode;
  }

  /** Create a new endpoint, validating that its RESTful properties are not
   * repeated and no identical endpoint exists (which is considered an endpoint
   * collision). Through the "args" property, additional endpoint behaviors can
   * be configured.
   *
   * @param verb REST verb.
   * @param route String route.
   * @param moduleOperation Function that will be called every time the endpoint
   * is called.
   * @param args Additional arguments for custom behaviours.
   * @returns The result of every endpoint is an object of type Result with the
   * response DTO, or failing that, with an object of type BaseError.
   */
  addEndpoint = (
    verb: RestVerb,
    route: Routes,
    moduleOperation?: ModuleOperation | undefined,
    args?: ProxyRouterArgs | undefined
  ) => this.routeNode.addEndpoint(verb, route, moduleOperation, args);
}

/** Parent abstract class of {@link RouteNode} that provides the implementations
 * and exposes them to the other abstract classes.
 */
export class AbstractRouteNode<Domain, Routes> {
  basePath: string;
  endpoints: Array<RouteEndpoint<Routes>>;
  isDuplicated: boolean;
  router: Router;
  scopeReference: AbstractApiRouter;
  domain?: Domain;
  version?: ApiVersion;

  constructor(args: RouteNodeArgs<Domain>) {
    const { basePath, domain, isDuplicated, router, scopeReference, version } =
      args;

    this.basePath = basePath;
    this.domain = domain;
    this.isDuplicated = isDuplicated;
    this.router = router;
    this.scopeReference = scopeReference;
    this.version = version;

    this.endpoints = [];
  }

  addEndpoint(
    verb: RestVerb,
    route: Routes,
    moduleOperation?: ModuleOperation,
    args?: ProxyRouterArgs
  ): void {
    // API route construction. All routes are formed by this formula.
    const uri = `${this.basePath}/${this.version}/${route}`;

    // Abort adding endpoint if domain value is undefined.
    if (this.domain === undefined)
      return Logger.warning(new RouteError.UndefinedDomainException());

    // Validate if this endpoint actually exists.
    const isDuplicated = this.scopeReference.hasUriDuplicity({
      domain: String(this.domain),
      version: this.version,
      uri: uri,
      verb,
    });

    if (isDuplicated || this.isDuplicated) return;

    this.endpoints.push({ uri: uri as unknown as Routes, verb });

    return this.proxy(this.router, verb, uri, moduleOperation, args);
  }

  /** Create the basic routes used for health checks and availability pings.
   *
   * @param uri Route string.
   */
  addBaseEndpoint(uri: string) {
    this.endpoints.push({ uri: uri as unknown as Routes, verb: "get" });

    this.router.get(uri, (_: Request, res: Response) => {
      return res.status(200).send(PING_MESSAGE);
    });
  }

  /** Creates the dedicated route for life verification of the monitoring
   * systems.
   *
   * @param uri Route string.
   */
  addMonitoringEndpoint(uri: string) {
    this.endpoints.push({ uri: uri as unknown as Routes, verb: "get" });

    this.router.get(uri, (_: Request, __: Response) => {
      throw new RouteError.MonitoringFalsePositiveException();
    });
  }

  /** This feature simplifies the creation of endpoints through Express.js and
   * reduces middleware implementation by applying a Proxy structural pattern.
   *
   * @TODO add descriptions to params
   * @param router Express Router instance.
   * @param verb Rest verb.
   * @param uri Route string.
   * @param moduleOperation Function that will be called every time the endpoint
   * is called.
   * @param args Additional arguments for custom behaviours.
   * @returns The result of every endpoint is an object of type Result with the
   * response DTO, or failing that, with an object of type BaseError.
   */
  private proxy(
    router: Router,
    verb: RestVerb,
    uri: string,
    moduleOperation?: ModuleOperation,
    args?: ProxyRouterArgs
  ): void {
    if (moduleOperation == undefined) {
      router[verb](uri, async (req, res) => await this.fallback(req, res));

      return;
    }

    router[verb](
      uri,
      async (req, res) => await this.apiCallback(req, res, moduleOperation)
    );

    return;
  }

  /** handles the invocation of the moduleOperation, obtains its result and
   * traps potential errors that may occur at the endpoint execution level.
   */
  private apiCallback = async <Req, Dto>(
    req: Req,
    res: ResponseBase<Dto>,
    moduleOperation: ModuleOperation
  ): Promise<ResponseBase<Dto>> => {
    try {
      const result = await moduleOperation(req, res);

      return res.status(result.code).json(result.getValue());
    } catch (e) {
      const failure = new RouteError.UndefinedFailure(e);
      return res.status(failure.code).json(failure);
    }
  };

  /** In case moduleOperation was not provided, will create a response using
   * statusCode 501 "NOT-IMPLEMENTED".
   */
  private fallback = async (
    _: Request,
    res: Response
  ): Promise<ResponseBase<Empty>> => {
    return res.status(ServerErrorCode["NOT-IMPLEMENTED"]).send();
  };
}
