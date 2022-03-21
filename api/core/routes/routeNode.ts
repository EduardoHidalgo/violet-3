import { Request, Response, Router } from "express";

import { environment } from "@/environment";
import { Empty, ResponseBase } from "@/core/api/api";
import { Result } from "@/core/index";
import { ServerErrorCode } from "@/core/error";
import { Logger } from "@/libs/logger";

import { BaseApiRouter } from "@/core/routes/apiRouter";
import { RouteError } from "@/core/routes/errors";
import { ApiVersion, RestVerb } from "@/core/routes/types";

const PING_MESSAGE = `[API Online] Target: ${environment.server.ENVIRONMENT}`;

/** Generic typing to infer the type of response from endpoints. */
type ModuleOperation = <Req, Dto>(
  req: Req,
  res: ResponseBase<Dto>
) => Promise<Result<Dto>>;

/** Additional arguments that can be passed through the {@link ProxyRouteNode}
 * when the register function is called, to customize the behavior of the
 * endpoint.
 */
interface ProxyRouterArgs {}

export interface RouteEndpoint {
  uri: string;
  verb: RestVerb;
}

/** Arguments required when {@link ProxyRouteNode} class is instanciated. */
export interface RouteNodeArgs {
  scope: BaseApiRouter;
  basePath: string;
  isDuplicated: boolean;
  router: Router;
  domain?: string;
  version?: ApiVersion;
}

// TODO add comments
export class HiddenRouteNode {
  domain?: string;
  version?: ApiVersion;

  basePath: string;
  endpoints: Array<RouteEndpoint>;
  isDuplicated: boolean;
  router: Router;
  scope: BaseApiRouter;

  constructor(args: RouteNodeArgs) {
    const { basePath, domain, isDuplicated, router, scope, version } = args;

    this.basePath = basePath;
    this.domain = domain;
    this.isDuplicated = isDuplicated;
    this.router = router;
    this.scope = scope;
    this.version = version;

    this.endpoints = [];
  }

  // TODO add comments
  addEndpoint(
    verb: RestVerb,
    route: string,
    moduleOperation?: ModuleOperation,
    args?: ProxyRouterArgs
  ): void {
    const uri = `${this.basePath}/${this.version}/${route}`;

    // Abort adding endpoint if domain value is undefined.
    if (this.domain === undefined)
      return Logger.warning(new RouteError.UndefinedDomainException());

    // Validate if this endpoint actually exists.
    const isDuplicated = this.scope.hasUriDuplicity({
      domain: this.domain,
      version: this.version,
      uri,
      verb,
    });

    if (isDuplicated || this.isDuplicated) return;

    this.endpoints.push({ uri, verb });

    return this.proxy(this.router, verb, uri, moduleOperation, args);
  }

  // TODO add comments
  addBaseEndpoint(uri: string) {
    this.endpoints.push({ uri, verb: "get" });

    this.router.get(uri, (_: Request, res: Response) => {
      return res.status(200).send(PING_MESSAGE);
    });
  }

  // TODO add comments
  addMonitoringEndpoint(uri: string) {
    this.endpoints.push({ uri, verb: "get" });

    this.router.get(uri, (_: Request, __: Response) => {
      throw new RouteError.MonitoringFalsePositiveException();
    });
  }

  /** This feature simplifies the creation of endpoints through Express.js and
   * reduces middleware implementation by applying a Proxy structural pattern.
   *
   * @TODO add descriptions to params
   * @param router
   * @param verb
   * @param uri
   * @param moduleOperation
   * @param args
   * @returns
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

export class RouteNode {
  private routeNode: HiddenRouteNode;

  constructor(routeNode: HiddenRouteNode) {
    this.routeNode = routeNode;
  }

  addEndpoint = (
    verb: RestVerb,
    route: string,
    moduleOperation?: ModuleOperation | undefined,
    args?: ProxyRouterArgs | undefined
  ) => this.routeNode.addEndpoint(verb, route, moduleOperation, args);
}
