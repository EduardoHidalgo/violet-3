import { BaseError, ServerErrorCode } from "@/core/error";

export namespace RouteError {
  export class UndefinedDomainException extends BaseError {
    constructor() {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        message: "",
        type: `${UndefinedDomainException.name}`,
        // TODO add detail and solution
      });
    }
  }

  export class DomainDoesntExistsFailure extends BaseError {
    // TODO use props in message
    constructor(domain: string) {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        // TODO add message
        message: "",
        type: `${DomainDoesntExistsFailure.name}`,
        // TODO add detail and solution
      });
    }
  }

  export class DuplicatedDomainException extends BaseError {
    // TODO use props in message
    constructor(domain: string) {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        // TODO add message
        message: "",
        type: `${DuplicatedDomainException.name}`,
        // TODO add detail and solution
      });
    }
  }

  export class DuplicatedEndpointException extends BaseError {
    // TODO use props in message
    constructor(uri: string, verb: string) {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        // TODO add message
        message: "",
        type: `${DuplicatedEndpointException.name}`,
        // TODO add detail and solution
      });
    }
  }

  export class DuplicatedVersionException extends BaseError {
    // TODO use props in message
    constructor(version: string) {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        // TODO add message
        message: "",
        type: `${DuplicatedVersionException.name}`,
        // TODO add detail and solution
      });
    }
  }

  export class PrintEndpointsFailure extends BaseError {
    constructor(error: any) {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        error,
        // TODO fix message with properly argument.
        message: "This is a debug sentry error for testing purpose.",
        type: `${PrintEndpointsFailure.name}`,
        // TODO add detail and solution
      });
    }
  }

  export class MonitoringFalsePositiveException extends BaseError {
    constructor() {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        message: "This is a debug sentry error for testing purpose.",
        type: `${MonitoringFalsePositiveException.name}`,
        // TODO add detail and solution
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
        error,
        // TODO add message
        message: "",
        type: `${UndefinedFailure.name}`,
        // TODO add detail and solution
      });
    }
  }

  export class VersionDoesntExistsFailure extends BaseError {
    // TODO use props in message
    constructor(version: string) {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        // TODO add message
        message: "",
        type: `${VersionDoesntExistsFailure.name}`,
        // TODO add detail and solution
      });
    }
  }
}
