import { Express, Request, Response, Router } from "express";

import { environment } from "@/server/environment";
import { Result } from "@/core/index";
import { ResponseBase } from "@/core/api/api";
import { BaseError, ServerErrorCode } from "@/core/error";
import { Logger } from "@/libs/logger";

export type RoutesMiddlewareFn = (app: Express) => void;

export type MainVersionRouteEntryFn = (apiRouter: ApiRouter) => void;

export type MainDomainRouteEntryFn = (routeGateway: RouteGateway) => void;

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

interface ApiRouterArgs {
  app: Express;
}

interface RouteGatewayRegisterArgs {
  version: ApiVersion;
}

interface HasDuplicitiesArgs {
  domain: string;
  uri: string;
  verb: RestVerb;
  version: ApiVersion;
}

interface RouteGatewayArgs {
  apiRouterScope: ApiRouter;
  basePath: string;
  router: Router;
  version: ApiVersion;
  isDuplicated: boolean;
}

type RouteEndpoint = { uri: string; verb: RestVerb };

interface RouteNodeArgs {
  apiRouterScope: ApiRouter;
  basePath: string;
  router: Router;
  domain: string;
  version: ApiVersion;
  isDuplicated: boolean;
}

interface LoggableEndpoint {
  domain: string;
  uri: string;
  verb: string;
  version: string;
}

interface RouteEndpointRegisterArgs {}

type ModuleOperation = <Req, Dto>(
  req: Req,
  res: ResponseBase<Dto>
) => Promise<Result<Dto>>;

interface ProxyRouterArgs {}

export class ApiRouter {
  private apiRouterScope: ApiRouter;
  private app: Express;
  private basePath: string;
  private gateways: Array<RouteGateway>;
  private versionlessNodes: Array<RouteNode>;

  constructor(args: ApiRouterArgs) {
    const { app } = args;

    this.apiRouterScope = this;
    this.app = app;
    this.gateways = [];
    this.versionlessNodes = [];

    this.basePath = environment.api.BASE_URI;
  }

  register(args: RouteGatewayRegisterArgs): RouteGateway {
    const { version } = args;

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

    return gateway;
  }

  turnOn() {
    for (const gateway of this.gateways) {
      try {
        this.app.use(gateway.router);

        this.printEndpoints();
      } catch (error) {
        const failure = new RouteError.TurningOnGatewayFailure(error);
        Logger.emergency(failure);
      }
    }
  }

  private sortLoggableEndpoints(): Array<LoggableEndpoint> {
    let list: Array<LoggableEndpoint> = [];

    for (const gateway of this.gateways) {
      for (const node of gateway.nodes) {
        for (const endpoint of node.endpoints) {
          list.push({
            domain: node.domain,
            uri: endpoint.uri,
            verb: endpoint.verb,
            version: gateway.version,
          });
        }
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
          list.filter((e) => e.verb == verb)
        );

        let listByDomainReintegrated: Array<LoggableEndpoint> = [];
        matrixByVerb.forEach((listByVerb) => {
          // sort all endpoints by uri.
          listByVerb.sort((a, b) => (a.uri > b.uri ? 1 : -1));

          listByDomainReintegrated =
            listByDomainReintegrated.concat(listByVerb);
        });

        listByVersionReintegrated = listByVersionReintegrated.concat(
          ...listByDomainReintegrated
        );
      });

      filteredList = filteredList.concat(...listByVersionReintegrated);
    });

    return filteredList;
  }

  private printEndpoints(): void {
    try {
      const loggableEndpoints = this.sortLoggableEndpoints();

      if (loggableEndpoints.length > 0) {
        let domainLongestLength = 0;
        let verbLongestLength = 0;
        let uriLongestLength = 0;
        loggableEndpoints.forEach((e) => {
          if (e.domain.length > domainLongestLength)
            domainLongestLength = e.domain.length;

          if (e.verb.length > verbLongestLength)
            verbLongestLength = e.verb.length;

          if (e.uri.length > uriLongestLength) uriLongestLength = e.uri.length;
        });

        let log = "List of Endpoints routed: \n";
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

        Logger.notice(log.toString());
      }
    } catch (error) {
      const failure = new RouteError.PrintEndpointsFailure(error);
      Logger.alert(failure);
    }
  }

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

  hasUriDuplicity(args: HasDuplicitiesArgs): boolean {
    const { domain, uri, verb, version } = args;

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
}

class RouteGateway {
  nodes: Array<RouteNode>;
  router: Router;
  version: ApiVersion;

  private apiRouterScope: ApiRouter;
  private isDuplicated: boolean;
  private basePath: string;

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

    this.addBaseEndpoints(node);

    this.nodes.push(node);

    return node;
  }

  addBaseEndpoints(node: RouteNode) {
    node.addBaseEndpoint("/");
    node.addBaseEndpoint(`${this.basePath}`);
    node.addBaseEndpoint(`${this.basePath}/${this.version}`);
    node.addDebuggingEndpoint(
      `${this.basePath}/${this.version}/debug-monitors`
    );
  }
}

class RouteNode {
  endpoints: Array<RouteEndpoint>;
  domain: string;
  version: ApiVersion;

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
    args?: RouteEndpointRegisterArgs
  ): void {
    const uri = `${this.basePath}/${this.version}/${route}`;

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

  private fallback = async (
    _: Request,
    res: Response
  ): Promise<Response<any, Record<string, any>>> => {
    return res.status(ServerErrorCode["NOT-IMPLEMENTED"]).send();
  };
}

namespace RouteError {
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
