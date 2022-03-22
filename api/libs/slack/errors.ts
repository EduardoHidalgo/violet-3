import { BaseError, ServerErrorCode } from "@/core/error";

export namespace SlackError {
  export class InitializationFailure extends BaseError {
    constructor(error: Error) {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        detail: "",
        error,
        message: "",
        solution: "",
        type: `${InitializationFailure.name}`,
      });
    }
  }

  export class PostMessageFailure extends BaseError {
    constructor(error: Error) {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        detail: "",
        error,
        message: "",
        solution: "",
        type: `${PostMessageFailure.name}`,
      });
    }
  }

  export class RequiredEnvironmentUndefinedFailure extends BaseError {
    constructor(variableName: string) {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        detail:
          "The environment variables required for Slack service was not provided correctly. This is a critical error.",
        message: `The environment variable '${variableName}' was required to run Slack service.`,
        solution:
          "Please provide the variables required to be able to start the Slack service properly.",
        type: `${RequiredEnvironmentUndefinedFailure.name}`,
      });
    }
  }

  export class UndefinedFailure extends BaseError {
    constructor(error: Error) {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        detail: "",
        error,
        message: "",
        solution: "",
        type: `${UndefinedFailure.name}`,
      });
    }
  }
}
