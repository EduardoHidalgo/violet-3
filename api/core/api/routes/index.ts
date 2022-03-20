import { Express, Request, Response, Router } from "express";

import { environment } from "@/environment";
import { Result } from "@/core/index";
import { ResponseBase } from "@/core/api/api";
import { BaseError, ServerErrorCode } from "@/core/error";
import { Logger } from "@/libs/logger";

// TODO add environment variable for logs + add logs

/** Type of function that should be used to define the main route middleware,
 * where all {@link VersionRouteMainEntryFn} are invoked. This middleware should
 * be called by the ServerApp.
 */
export type RoutesMiddlewareFn = (app: Express) => void;

/** Type of function that should be used to define the route functions in
 * charge of declaring a new api version.
 */
export type VersionRouteMainEntryFn = (apiRouter: ApiRouter) => void;

/** Type of function that should be used to define the route functions in
 * charge of declaring the endpoints of a particular domain.
 */
export type DomainRouteMainEntryFn = (routeGateway: RouteGateway) => void;

enum ApiVersionEnum {
  v1 = "v1",
  v2 = "v2",
  v3 = "v3",
  v4 = "v4",
  v5 = "v5",
  v6 = "v6",
  v7 = "v7",
  v8 = "v8",
  v9 = "v9",
}

const apiVersions = Object.values(ApiVersionEnum);

type ApiVersion = keyof typeof ApiVersionEnum;

type RestVerb =
  | "all"
  | "delete"
  | "get"
  | "head"
  | "options"
  | "patch"
  | "post"
  | "put";

/** Arguments required when {@link ApiRouter} class is instanciated. */
interface ApiRouterArgs {
  app: Express;
}

/** Arguments required when {@link RouteGateway} class is instanciated. */
interface RouteGatewayArgs {
  apiRouterScope: ApiRouter;
  basePath: string;
  isDuplicated: boolean;
  router: Router;
  version: ApiVersion;
}

/** Arguments required when {@link RouteNode} class is instanciated. */
interface RouteNodeArgs {
  apiRouterScope: ApiRouter;
  basePath: string;
  isDuplicated: boolean;
  router: Router;
  domain?: string;
  version?: ApiVersion;
}

interface RouteEndpoint {
  uri: string;
  verb: RestVerb;
}

interface LoggableEndpoint {
  domain: string;
  uri: string;
  verb: string;
  version: string;
}

/** Generic typing to infer the type of response from endpoints. */
type ModuleOperation = <Req, Dto>(
  req: Req,
  res: ResponseBase<Dto>
) => Promise<Result<Dto>>;

/** Additional arguments that can be passed through the {@link RouteNode} when
 * the register function is called, to customize the behavior of the endpoint.
 */
interface ProxyRouterArgs {}

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
  private apiRouterScope: ApiRouter;
  private app: Express;
  private basePath: string;
  private gateways: Array<RouteGateway>;
  baseNodes: Array<RouteNode>;

  constructor(args: ApiRouterArgs) {
    const { app } = args;

    this.apiRouterScope = this;
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
   * {@link DomainRouteMainEntryFn} function.
   */
  register(args: { version: ApiVersion }): RouteGateway {
    const { version } = args;

    // Check if this version doesn't exists already.
    const isDuplicated = this.apiRouterScope.hasVersionDuplicity(version);

    const router = Router();

    const gateway = new RouteGateway({
      apiRouterScope: this.apiRouterScope,
      basePath: this.basePath,
      isDuplicated: isDuplicated,
      router,
      version,
    });

    this.gateways.push(gateway);

    // Each time a new API version is created, should be added base endpoints
    // related to this version.
    this.addGatewayBaseEndpoints(router, version);

    return gateway;
  }

  /** Consume all {@link RouteGateway}'s and apply Express.Router instances on
   * top of the Express app.
   */
  turnOn() {
    for (const gateway of this.gateways) {
      try {
        this.app.use(gateway.router);

        // Log all registered endpoints successfully.
        this.logEndpoints();
      } catch (error) {
        const failure = new RouteError.TurningOnGatewayFailure(error);
        Logger.emergency(failure);
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
    const node = new RouteNode({
      apiRouterScope: this.apiRouterScope,
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
  addGatewayBaseEndpoints(router: Router, version: ApiVersion) {
    const node = new RouteNode({
      apiRouterScope: this.apiRouterScope,
      basePath: this.basePath,
      isDuplicated: false,
      router,
      version,
    });

    node.addBaseEndpoint(`${this.basePath}/${version}`);
    node.addDebuggingEndpoint(`${this.basePath}/${version}/debug-monitors`);

    this.baseNodes.push(node);
  }

  /** Custom sorting algorithm to log registered endpoints. Sorts the endpoints
   * based on the following priority order: Version > Domain > Verb > Path.
   */
  private sortLoggableEndpoints(): Array<LoggableEndpoint> {
    // Simplified list of endpoints.
    let list: Array<LoggableEndpoint> = [];

    // Search for each RouteEndpoint on each RouteNode inside each RouteGateway.
    for (const gateway of this.gateways) {
      for (const node of gateway.nodes) {
        for (const endpoint of node.endpoints) {
          list.push({
            domain: String(node.domain),
            uri: endpoint.uri,
            verb: endpoint.verb,
            version: gateway.version,
          });
        }
      }
    }

    // Search for each RouteEndpoint that has no RouteGateway parent (base
    // endpoints).
    for (const node of this.apiRouterScope.baseNodes) {
      for (const endpoint of node.endpoints) {
        list.push({
          domain: "base",
          uri: endpoint.uri,
          verb: endpoint.verb,
          version: node.version ? node.version : "--",
        });
      }
    }

    // sort all endpoints by version.
    list.sort((a, b) => (a.version > b.version ? 1 : -1));

    // Detect how many versions was registered.
    let versions: Array<string> = [];
    for (const endpoint of list) {
      if (versions.includes(endpoint.version) == false)
        versions.push(endpoint.version);
    }

    // Separate list by versions.
    let matrixByVersion: Array<Array<LoggableEndpoint>> = versions.map(
      (version) => list.filter((e) => e.version == version)
    );

    let filteredList: Array<LoggableEndpoint> = [];
    matrixByVersion.forEach((listByVersion) => {
      // sort all endpoints by domain.
      listByVersion.sort((a, b) => (a.domain > b.domain ? 1 : -1));

      // Detect how many domains was registered (only inside this listByVersion).
      let domains: Array<string> = [];
      for (const endpointByDomain of listByVersion) {
        if (domains.includes(endpointByDomain.domain) == false)
          domains.push(endpointByDomain.domain);
      }

      // Separate listByVersion by domains.
      let matrixByDomains: Array<Array<LoggableEndpoint>> = domains.map(
        (domain) => listByVersion.filter((e) => e.domain == domain)
      );

      let listByVersionReintegrated: Array<LoggableEndpoint> = [];
      matrixByDomains.forEach((listByDomain) => {
        // sort all endpoints by verb.
        listByDomain.sort((a, b) => (a.verb > b.verb ? 1 : -1));

        // Detect how many verbs was registered (only inside this listByVersion).
        let verbs: Array<string> = [];
        for (const endpointByVersion of listByDomain) {
          if (verbs.includes(endpointByVersion.verb) == false)
            verbs.push(endpointByVersion.verb);
        }

        // Separate listByDomain by verbs.
        let matrixByVerb: Array<Array<LoggableEndpoint>> = verbs.map((verb) =>
          listByDomain.filter((e) => e.verb == verb)
        );

        let listByDomainReintegrated: Array<LoggableEndpoint> = [];
        matrixByVerb.forEach((listByVerb) => {
          // sort all endpoints by uri.
          listByVerb.sort((a, b) => (a.uri > b.uri ? 1 : -1));

          // Reintegrate verbs
          listByDomainReintegrated =
            listByDomainReintegrated.concat(listByVerb);
        });

        // Reintegrate domains
        listByVersionReintegrated = listByVersionReintegrated.concat(
          listByDomainReintegrated
        );
      });

      // Reintegrate versions
      filteredList = filteredList.concat(listByVersionReintegrated);
    });

    return filteredList;
  }

  /** Create a unique log that includes all endpoints registered successfully.
   */
  private logEndpoints(): void {
    try {
      const loggableEndpoints = this.sortLoggableEndpoints();

      if (loggableEndpoints.length > 0) {
        let domainLongestLength = 0;
        let verbLongestLength = 0;
        let uriLongestLength = 0;

        // Calculate the longest string of domains, verbs and uris, because
        // are added spaces on strings builded for better presentation.
        loggableEndpoints.forEach((e) => {
          if (e.domain.length > domainLongestLength)
            domainLongestLength = e.domain.length;

          if (e.verb.length > verbLongestLength)
            verbLongestLength = e.verb.length;

          if (e.uri.length > uriLongestLength) uriLongestLength = e.uri.length;
        });

        let log = "List of Endpoints routed: \n";

        // Append each endpoint on the same log string, so it only log once.
        loggableEndpoints.forEach((e) => {
          const domainSpacedCount = domainLongestLength - e.domain.length;
          const verbSpacedCount = verbLongestLength - e.verb.length;
          const uriSpacedCount = uriLongestLength - e.uri.length;

          const domainSpaced =
            domainSpacedCount > 0 ? " ".repeat(domainSpacedCount) : "";
          const verbSpaced =
            verbSpacedCount > 0 ? " ".repeat(verbSpacedCount) : "";
          const uriSpaced =
            uriSpacedCount > 0 ? " ".repeat(uriSpacedCount) : "";

          log += `${e.version} `;
          log += `${e.domain}${domainSpaced} -> `;
          log += `${e.verb.toUpperCase()}${verbSpaced} `;
          log += `${e.uri}${uriSpaced} \n`;
        });

        // Log endpoints.
        Logger.notice(log.toString());
      }
    } catch (error) {
      const failure = new RouteError.PrintEndpointsFailure(error);
      Logger.alert(failure);
    }
  }

  /** Validates that the version you want to use to create a new
   * {@link RouteGateway} does not currently exist.
   *
   * @returns true if already exists
   */
  hasVersionDuplicity(version: ApiVersion): boolean {
    for (const gateway of this.gateways) {
      if (gateway.version == version) {
        const exception = new RouteError.DuplicatedVersionException(version);
        Logger.warning(exception);

        return true;
      }
    }

    return false;
  }

  /** Validates that the version and domain you want to use to create a new
   * {@link RouteNode} does not currently exist.
   *
   * @returns true if already exists
   */
  hasDomainDuplicity(domain: string, version: ApiVersion): boolean {
    const gateway = this.gateways.find((g) => g.version == version);

    if (gateway == undefined) {
      const exception = new RouteError.VersionDoesntExistsFailure(version);
      Logger.warning(exception);

      return true;
    }

    for (const node of gateway.nodes) {
      if (node.domain == domain) {
        const exception = new RouteError.DuplicatedVersionException(version);
        Logger.warning(exception);

        return true;
      }
    }

    return false;
  }

  /** Validates that the domain, uri, verb and version you want to use to create
   * a new {@link RouteEndpoint} does not currently exist.
   *
   * @returns true if already exists
   */
  hasUriDuplicity(args: {
    domain?: string;
    uri: string;
    verb: RestVerb;
    version?: ApiVersion;
  }): boolean {
    const { domain, uri, verb, version } = args;

    if (version === undefined || domain === undefined)
      return this.checkBaseEndpointDuplicity(uri, verb);

    return this.checkCommonEndpointDuplicity(domain, uri, verb, version);
  }

  private checkBaseEndpointDuplicity(uri: string, verb: RestVerb): boolean {
    for (const node of this.apiRouterScope.baseNodes) {
      for (const endpoint of node.endpoints) {
        if (endpoint.uri == uri && endpoint.verb == verb) {
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

class RouteGateway {
  nodes: Array<RouteNode>;
  router: Router;
  version: ApiVersion;

  private apiRouterScope: ApiRouter;
  private isDuplicated: boolean;
  private basePath: string;
  private domain!: string;

  constructor(args: RouteGatewayArgs) {
    const { apiRouterScope, basePath, isDuplicated, router, version } = args;

    this.apiRouterScope = apiRouterScope;
    this.basePath = basePath;
    this.isDuplicated = isDuplicated;
    this.router = router;
    this.version = version;

    this.nodes = [];
  }

  register(domain: string): RouteNode {
    const isDomainDuplicated = this.apiRouterScope.hasDomainDuplicity(
      domain,
      this.version
    );

    const isDuplicated = this.isDuplicated
      ? this.isDuplicated
      : isDomainDuplicated;

    const node = new RouteNode({
      apiRouterScope: this.apiRouterScope,
      basePath: this.basePath,
      router: this.router,
      version: this.version,
      domain,
      isDuplicated,
    });

    this.nodes.push(node);
    this.domain = domain;

    return node;
  }
}

class RouteNode {
  endpoints: Array<RouteEndpoint>;
  domain?: string;
  version?: ApiVersion;

  private apiRouterScope: ApiRouter;
  private isDuplicated: boolean;
  private basePath: string;
  private pingMessage: string;
  private router: Router;

  constructor(args: RouteNodeArgs) {
    const { apiRouterScope, basePath, domain, isDuplicated, router, version } =
      args;

    this.apiRouterScope = apiRouterScope;
    this.basePath = basePath;
    this.domain = domain;
    this.isDuplicated = isDuplicated;
    this.router = router;
    this.version = version;

    this.endpoints = [];
    this.pingMessage = `[Violet API Online] Target: ${environment.server.ENVIRONMENT}`;
  }

  addBaseEndpoint(uri: string) {
    this.endpoints.push({ uri, verb: "get" });

    this.router.get(uri, (_: Request, res: Response) => {
      return res.status(200).send(this.pingMessage);
    });
  }

  addDebuggingEndpoint(uri: string) {
    this.endpoints.push({ uri, verb: "get" });

    this.router.get(
      `${this.basePath}/${this.version}/debug-monitors`,
      (_: Request, __: Response) => {
        const exception = new RouteError.SentryFalsePositiveException();

        throw exception;
      }
    );
  }

  addEndpoint(
    verb: RestVerb,
    route: string,
    moduleOperation?: ModuleOperation,
    args?: ProxyRouterArgs
  ): void {
    const uri = `${this.basePath}/${this.version}/${route}`;

    if (this.domain === undefined) {
      const exception = new RouteError.UndefinedDomainException();
      Logger.warning(exception);

      return;
    }

    const isDuplicated = this.apiRouterScope.hasUriDuplicity({
      domain: this.domain,
      version: this.version,
      uri,
      verb,
    });

    if (isDuplicated || this.isDuplicated) return;

    this.endpoints.push({ uri, verb });

    return this.proxy(this.router, verb, uri, moduleOperation, args);
  }

  /** This feature simplifies the creation of endpoints through Express.js and
   * reduces middleware implementation by applying a Proxy structural pattern.
   *
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

      return undefined as void;
    }

    router[verb](
      uri,
      async (req, res) => await this.apiCallback(req, res, moduleOperation)
    );

    return undefined as void;
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
  ): Promise<Response<any, Record<string, any>>> => {
    return res.status(ServerErrorCode["NOT-IMPLEMENTED"]).send();
  };
}

namespace RouteError {
  export class UndefinedDomainException extends BaseError {
    constructor() {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        message: "",
        type: `${UndefinedDomainException.name}`,
      });
    }
  }

  export class DomainDoesntExistsFailure extends BaseError {
    constructor(domain: string) {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        message: "",
        type: `${DomainDoesntExistsFailure.name}`,
      });
    }
  }

  export class DuplicatedDomainException extends BaseError {
    constructor(domain: string) {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        message: "",
        type: `${DuplicatedDomainException.name}`,
      });
    }
  }

  export class DuplicatedEndpointException extends BaseError {
    constructor(uri: string, verb: string) {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        message: "",
        type: `${DuplicatedEndpointException.name}`,
      });
    }
  }

  export class DuplicatedVersionException extends BaseError {
    constructor(version: string) {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        message: "",
        type: `${DuplicatedVersionException.name}`,
      });
    }
  }

  export class PrintEndpointsFailure extends BaseError {
    constructor(error: any) {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        message: "This is a debug sentry error for testing purpose.",
        type: `${PrintEndpointsFailure.name}`,
        error,
      });
    }
  }

  export class SentryFalsePositiveException extends BaseError {
    constructor() {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        message: "This is a debug sentry error for testing purpose.",
        type: `${SentryFalsePositiveException.name}`,
      });
    }
  }

  export class TurningOnGatewayFailure extends BaseError {
    constructor(error: any) {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        message: "",
        type: `${TurningOnGatewayFailure.name}`,
        error,
      });
    }
  }

  export class UndefinedFailure extends BaseError {
    constructor(error: any) {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        message: "",
        type: `${UndefinedFailure.name}`,
        error,
      });
    }
  }

  export class VersionDoesntExistsFailure extends BaseError {
    constructor(version: string) {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        message: "",
        type: `${VersionDoesntExistsFailure.name}`,
      });
    }
  }
}
