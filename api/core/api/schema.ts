import Joi from "joi";

import { ApiErrorCode, BaseError, ServerErrorCode } from "@/core/error";

export namespace SchemaError {
  export class BodyException extends BaseError {
    constructor(e: Joi.ValidationError) {
      super({
        code: ApiErrorCode["BAD-REQUEST"],
        detail:
          "The executed endpoint has rules about the form of the information that must be received through the body parameters, which have not been fulfilled.",
        error: e ? e.details : null,
        message: "Bad body request error ocurred.",
        solution:
          "Please review the relevant documentation and the error information returned in the response.",
        type: `${BodyException.name}`,
      });
    }
  }

  export class HeadersException extends BaseError {
    constructor(e: Joi.ValidationError) {
      super({
        code: ApiErrorCode["BAD-REQUEST"],
        detail:
          "The executed endpoint has rules about the form of the information that must be received through the header parameters, which have not been fulfilled.",
        error: e ? e.details : null,
        message: "Bad headers request error ocurred.",
        type: `${HeadersException.name}`,
        solution:
          "Please review the relevant documentation and the error information returned in the response.",
      });
    }
  }

  export class ParamsException extends BaseError {
    constructor(e: Joi.ValidationError) {
      super({
        code: ApiErrorCode["BAD-REQUEST"],
        detail:
          "The executed endpoint has rules about the form of the information that must be received through the route params, which have not been fulfilled.",
        error: e ? e.details : null,
        message: "Bad params request error ocurred.",
        type: `${ParamsException.name}`,
        solution:
          "Please review the relevant documentation and the error information returned in the response.",
      });
    }
  }

  export class QueryException extends BaseError {
    constructor(e: Joi.ValidationError) {
      super({
        code: ApiErrorCode["BAD-REQUEST"],
        detail:
          "The executed endpoint has rules about the form of the information that must be received through the query parameters, which have not been fulfilled.",
        error: e ? e.details : null,
        message: "Bad query request error ocurred.",
        type: `${QueryException.name}`,
        solution:
          "Please review the relevant documentation and the error information returned in the response.",
      });
    }
  }

  export class UndefinedFailure extends BaseError {
    public constructor(error: any) {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        error,
        detail:
          "Some undefined error has occurred, which is considered a server failure.",
        message:
          "An unexpected error occurred trying to execute schema validation.",
        type: `${UndefinedFailure.name}`,
        solution:
          "There is no set solution. You need to contact the support team for further assistance.",
      });
    }
  }
}
