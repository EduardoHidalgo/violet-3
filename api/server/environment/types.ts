import { BaseError, ServerErrorCode } from "@/core/error";

export namespace EnvironmentError {
  export class EnvironmentValidationFailure extends BaseError {
    constructor() {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        detail: "This is a critical error on the server.",
        message: "The server variable environment validation has failed.",
        solution:
          "There is no set solution. You need to contact the support team for further assistance.",
        type: `${EnvironmentValidationFailure.name}`,
      });
    }
  }

  export class OptionalEnvironmentUndefinedException extends BaseError {
    constructor(variable: string) {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        detail:
          "This exception means this variable was not provided or setted properly in the environment variable file.",
        message: `The environment variable ${variable} was undefined, but it's also optional provide it.`,
        solution:
          "This variable is optional, but it's recommended to provided to take advantage of all server features.",
        type: `${EnvironmentUndefinedException.name}`,
      });
    }
  }

  export class EnvironmentUndefinedException extends BaseError {
    constructor(variable: string) {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        detail:
          "This exception means this variable was not provided or setted properly in the environment variable file. Server could not start without this env var.",
        message: `The environment variable ${variable} was undefined.`,
        solution:
          "Please provide the variable to be able to start the server properly.",
        type: `${EnvironmentUndefinedException.name}`,
      });
    }
  }
}

/** Environments defined and used by Node.js to set how the server will run. */
export enum NodeEnvironment {
  /** Development environment for Node.js, not optimized. */
  development = "development",

  /** Production environment for Node.js, optimized.
   *
   * @link For more information about production optimizations:
   * https://expressjs.com/en/advanced/best-practice-performance.html#set-node_env-to-production
   */
  production = "production",
}

export type NodeEnvironmentType = keyof typeof NodeEnvironment;

/** Definition of the app environment, inherent to the node server environment.
 * This environment dictates the set of settings and environment variables that
 * will be applied to the app. These environments are part of the infrastructure
 * and CI of the system.
 */
export enum ServerEnvironment {
  /** Development environment. */
  development = "development",

  /** Local environment. */
  local = "local",

  /** Production environment. */
  production = "production",

  /** Open Testing environment. */
  testing = "testing",

  /** Automation Testing environment. */
  automation = "automation",
}

export type ServerEnvironmentType = keyof typeof ServerEnvironment;

/** Environment variable typo. This is how dotenv and Node represents
 * variables. */
export type EnvVar = string | undefined;
