import { BaseError, ServerErrorCode } from "@/core/error";

export namespace MonitoringError {
  export namespace Sentry {
    export class RequiredEnvironmentUndefinedFailure extends BaseError {
      constructor(variableName: string) {
        super({
          code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
          detail:
            "The environment variables required for Sentry monitoring was not provided correctly. This is a critical error.",
          message: `The environment variable '${variableName}' was required to run Sentry monitoring service.`,
          solution:
            "Please provide the variables required to be able to start the Sentry service properly.",
          type: `${RequiredEnvironmentUndefinedFailure.name}`,
        });
      }
    }

    export class UndefinedFailure extends BaseError {
      constructor(error: Error) {
        super({
          code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
          detail: "This is a critical error on the server.",
          error,
          message: "The Sentry monitoring configuration has failed.",
          solution:
            "There is no set solution. You need to contact the support team for further assistance.",
          type: `${UndefinedFailure.name}`,
        });
      }
    }
  }
}
