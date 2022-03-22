import { BaseError, ServerErrorCode } from "@/core/error";

export namespace RouteError {
  export class UndefinedDomainException extends BaseError {
    constructor() {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        detail:
          "Some endpoint had an undefined domain value while trying to add it to a RouteNode. This should not have happened and is a major error, although it may be due to human error in the domain definition.",
        message: "Some endpoint had an undefined domain.",
        solution:
          "There is no set solution. You need to contact the support team for further assistance.",
        type: `${UndefinedDomainException.name}`,
      });
    }
  }

  export class DomainDoesntExistsFailure extends BaseError {
    constructor(domain: string) {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        detail: `An endpoint has tried to be validated without previously registering the domain '${domain}' to which it belongs.`,
        message: "There is no domain registered for this endpoint.",
        solution:
          "This is probably a human error in the routing implementation.",
        type: `${DomainDoesntExistsFailure.name}`,
      });
    }
  }

  export class DuplicatedDomainException extends BaseError {
    constructor(domain: string) {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        detail: `The domain '${domain}' that was attempted to be registered already exists previously in the RouteGateways list of the current version.`,
        message: "The domain tried to register already exists.",
        solution:
          "This is probably a human error in the routing implementation. Try using a different domain name.",
        type: `${DuplicatedDomainException.name}`,
      });
    }
  }

  export class DuplicatedEndpointException extends BaseError {
    constructor(uri: string, verb: string) {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        detail: `The endpoint with uri '${uri}' and verb '${verb}' that was attempted to be registered already exists previously in the RouteGateway of the current version.`,
        message: "The endpoint tried to register already exists.",
        solution:
          "This is probably a human error in the routing implementation. Try using a different verb and uri values, pursuing the RESTful principles.",
        type: `${DuplicatedEndpointException.name}`,
      });
    }
  }

  export class DuplicatedVersionException extends BaseError {
    constructor(version: string) {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        detail: `The version '${version}' that was attempted to be registered already exists previously in the ApiRouter instance.`,
        message: "The version tried to register already exists.",
        solution:
          "This is probably a human error in the routing implementation. Try using a different version.",
        type: `${DuplicatedVersionException.name}`,
      });
    }
  }

  export class PrintEndpointsFailure extends BaseError {
    constructor(error: any) {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        error,
        detail: "This should not happen and is a critical error.",
        message: "Route tree logging failed.",
        solution:
          "There is no set solution. You need to contact the support team for further assistance.",
        type: `${PrintEndpointsFailure.name}`,
      });
    }
  }

  export class MonitoringFalsePositiveException extends BaseError {
    constructor() {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        detail: "You shouldn't worry about this error, was intentional.",
        message:
          "This is a debug error for testing purposes on monitoring services.",
        solution: "There is no set solution.",
        type: `${MonitoringFalsePositiveException.name}`,
      });
    }
  }

  export class TurningOnGatewayFailure extends BaseError {
    constructor(error: Error) {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        detail: "This should not happen and is a critical error.",
        error,
        message: "Starting routing has failed.",
        solution:
          "There is no set solution. You need to contact the support team for further assistance.",
        type: `${TurningOnGatewayFailure.name}`,
      });
    }
  }

  export class UndefinedRouteFailure extends BaseError {
    constructor(error: Error) {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        detail:
          "Some undefined error has occurred executing an endpoint request, which is considered a critical server failure.",
        error,
        message: "An unexpected error occurred trying to execute an endpoint.",
        solution:
          "There is no set solution. You need to contact the support team for further assistance.",
        type: `${UndefinedRouteFailure.name}`,
      });
    }
  }

  export class VersionDoesntExistsFailure extends BaseError {
    constructor(version: string) {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        detail: `Apparently during some validations of the ApiRouter there was no RouteGateway registered under the version '${version}' used.`,
        message:
          "The version that was tried to use on validations doesn't exists.",
        solution:
          "There is no set solution. You need to contact the support team for further assistance.",
        type: `${VersionDoesntExistsFailure.name}`,
      });
    }
  }
}
