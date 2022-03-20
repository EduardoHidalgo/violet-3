import { BaseError, ServerErrorCode } from "@/core/error";

export namespace EnvironmentError {
  export class EnvironmentValidatorFailure extends BaseError {
    constructor() {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        message:
          "The server variable environment validation has failed. This is a " +
          "critical error on the server.",
        type: `${EnvironmentValidatorFailure.name}`,
      });
    }
  }

  export class EnvironmentUndefinedException extends BaseError {
    constructor(envVariable: string) {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        message:
          `The environment variable ${envVariable} was undefined. ` +
          "This means that was not provided or setted properly in the " +
          "environment variable file. Server could not start without " +
          "this env var.",
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

  /** Testing environment. */
  testing = "testing",
}

export type ServerEnvironmentType = keyof typeof ServerEnvironment;

/** Environment variable typo. This is how dotenv and Node represents
 * variables. */
export type EnvVar = string | undefined;
