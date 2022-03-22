import { HttpCode } from "@/core/error";

export interface ErrorArgs {
  /** Status code thrown when an error appears. This code should be used as a
   * http response code status. */
  code: HttpCode;

  /** Code string-based to identify the error catched. This type provides a way
   * to easily identifies and track which errors appears and where. */
  type: string;

  /** User-friendly message that frontend apps could use to present to end-users
   * as a clear explanation of what happened. */
  message: string;

  /** Error message provided by the code execution. */
  error?: any;

  /** Detailed message oriented to developer readers. Should provide technical
   * info about what happened and give insight of where should be the mistake. */
  detail?: string;

  /** EventId of Sentry error catching, for debug relation process. */
  sentryEventId?: string;

  /** Brief message oriented to users readers. It must provide an action to be
   * taken as a procedure to resolve or act in response to the error. */
  solution?: string;

  /** Stack trace of the call path taken to reach the point at which error was
   * raised. */
  stack?: string;
}

/** Error class base to any exception or error thrown through all the project.
 * This class provide consistency on all exceptions and errors.
 */
export class BaseError extends Error {
  /** Status code thrown when an error appears. This code should be used as a
   * http response code status. */
  code: HttpCode;

  /** Code string-based to identify the error catched. This type provides a way
   * to easily identifies and track which errors appears and where. */
  type: string;

  /** User-friendly message that frontend apps could use to present to end-users
   * as a clear explanation of what happened. */
  message: string;

  /** Error message provided by the code execution. */
  error?: any;

  /** Detailed message oriented to developer readers. Should provide technical
   * info about what happened and give insight of where should be the mistake. */
  detail?: string;

  /** EventId of Sentry error catching, for debug relation process. */
  sentryEventId?: string;

  /** Brief message oriented to users readers. It must provide an action to be
   * taken as a procedure to resolve or act in response to the error. */
  solution?: string;

  /** Stack trace of the call path taken to reach the point at which error was
   * raised. */
  stack?: string;

  constructor(args: ErrorArgs) {
    super();

    const { code, detail, error, message, sentryEventId, solution, type } =
      args;

    if (error instanceof Error) {
      Object.defineProperty(error, "message", { enumerable: true });
      Object.defineProperty(error, "name", { enumerable: true });
      Object.defineProperty(error, "stack", { enumerable: true });
    }

    if (this.stack === undefined) {
      this.stack = new Error().stack;
    }

    this.code = code;
    this.detail = detail;
    this.error = error;
    this.message = message;
    this.sentryEventId = sentryEventId;
    this.solution = solution;
    this.type = type;
  }

  toString = () => JSON.stringify(this);
}
