import Joi from "joi";

import { ApiErrorCode, BaseError, ServerErrorCode } from "@/core/error";

export namespace SchemaError {
  export class UndefinedFailure extends BaseError {
    public constructor(error: any) {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        message:
          "An unexpected error occurred trying to execute schema validation.",
        type: `${UndefinedFailure.name}`,
        error,
      });
    }
  }

  export class BodyException extends BaseError {
    constructor(e: Joi.ValidationError) {
      super({
        code: ApiErrorCode["BAD-REQUEST"],
        error: e ? e.details : null,
        message: "Bad body request error ocurred.",
        type: `${BodyException.name}`,
      });
    }
  }

  export class QueryException extends BaseError {
    constructor(e: Joi.ValidationError) {
      super({
        code: ApiErrorCode["BAD-REQUEST"],
        error: e ? e.details : null,
        message: "Bad query request error ocurred.",
        type: `${QueryException.name}`,
      });
    }
  }

  export class ParamsException extends BaseError {
    constructor(e: Joi.ValidationError) {
      super({
        code: ApiErrorCode["BAD-REQUEST"],
        error: e ? e.details : null,
        message: "Bad params request error ocurred.",
        type: `${ParamsException.name}`,
      });
    }
  }

  export class HeadersException extends BaseError {
    constructor(e: Joi.ValidationError) {
      super({
        code: ApiErrorCode["BAD-REQUEST"],
        error: e ? e.details : null,
        message: "Bad headers request error ocurred.",
        type: `${HeadersException.name}`,
      });
    }
  }
}
