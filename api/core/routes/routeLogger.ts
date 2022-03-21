import { Logger } from "@/libs/logger";

import { RouteError } from "@/core/routes/errors";
import { BaseRouteGateway } from "@/core/routes/routeGateway";
import { HiddenRouteNode } from "@/core/routes/routeNode";

interface LoggableEndpoint {
  domain: string;
  uri: string;
  verb: string;
  version: string;
}

export class RouteLogger {
  constructor() {}

  /** Custom sorting algorithm (and very complex) to log registered endpoints.
   * Sorts the endpoints based on the following priority order:
   * Version > Domain > Verb > Path.
   */
  private static sort(
    baseNodes: Array<HiddenRouteNode>,
    gateways: Array<BaseRouteGateway>
  ): Array<LoggableEndpoint> {
    // Simplified list of endpoints.
    let list: Array<LoggableEndpoint> = [];

    // Search for each RouteEndpoint on each RouteNode inside each RouteGateway.
    for (const gateway of gateways) {
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
    // endpoints) and create a loggableEndpoint representation of it.
    for (const node of baseNodes) {
      for (const endpoint of node.endpoints) {
        list.push({
          domain: "base",
          uri: endpoint.uri,
          verb: endpoint.verb,
          // "--" string is used as placeholder if endpoint has no version
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
  static log(
    baseNodes: Array<HiddenRouteNode>,
    gateways: Array<BaseRouteGateway>
  ): void {
    try {
      const loggableEndpoints = this.sort(baseNodes, gateways);

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

        // Base log string.
        let log = "List of Endpoints routed: \n";

        // Append each endpoint on the same log string, so it only log once.
        loggableEndpoints.forEach((e) => {
          // Determine counters for spacing, just beauty logs.
          const domainSpacedCount = domainLongestLength - e.domain.length;
          const verbSpacedCount = verbLongestLength - e.verb.length;
          const uriSpacedCount = uriLongestLength - e.uri.length;

          // build strings
          const domainSpaced =
            domainSpacedCount > 0 ? " ".repeat(domainSpacedCount) : "";
          const verbSpaced =
            verbSpacedCount > 0 ? " ".repeat(verbSpacedCount) : "";
          const uriSpaced =
            uriSpacedCount > 0 ? " ".repeat(uriSpacedCount) : "";

          // Append information
          log += `${e.version} `;
          log += `${e.domain}${domainSpaced} -> `;
          log += `${e.verb.toUpperCase()}${verbSpaced} `;
          log += `${e.uri}${uriSpaced} \n`;
        });

        // Log endpoints.
        Logger.notice(log);
      }
    } catch (error) {
      Logger.alert(new RouteError.PrintEndpointsFailure(error));
    }
  }
}
