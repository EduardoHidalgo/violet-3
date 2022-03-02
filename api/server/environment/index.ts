import dotenv from "dotenv";

import { Parser } from "@/libs/utils/parser";
import { BaseError, ServerErrorCode } from "@/core/error";

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

/** Environments defined and used by the internal server app. Provides all the
 * required initial variables like credentials, states, conditions, db
 * connections, etc, for server running.
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

export interface PrimitiveEnvsExtension {
  readonly API_BASE_URI: EnvVar;
  readonly DEPLOY: EnvVar;
  readonly SERVER_ENVIRONMENT: EnvVar;
  readonly SERVER_ENV_DEBUG: EnvVar;
  readonly SERVER_LOGGER_PATH: EnvVar;
  readonly SERVER_LOG_ENVIRONMENT: EnvVar;
  readonly SERVER_NAME: EnvVar;
  readonly SERVER_PORT: EnvVar;
  readonly SERVER_RATE_LIMIT_MAX_REQUESTS: EnvVar;
  readonly SERVER_RATE_LIMIT_WMS_MINUTES: EnvVar;
}

export type PrimitiveEnvs = NodeJS.ProcessEnv & PrimitiveEnvsExtension;

export namespace EnvironmentError {
  export class EnvironmentValidationException extends BaseError {
    constructor() {
      super({
        code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
        message:
          "The server variable environment validation has failed. This is a " +
          "critical error on the server.",
        type: `${EnvironmentValidationException.name}`,
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

class EnvironmentValidator {
  private envs: PrimitiveEnvs;
  private error: BaseError | null;

  constructor() {
    this.envs = process.env as PrimitiveEnvs;
    this.error = null;
  }

  validateEnvironment() {
    try {
      this.validateServerEnvs();
      if (this.error != null) return this.error;

      return true;
    } catch (error) {
      return new EnvironmentError.EnvironmentValidationException();
    }
  }

  private validateServerEnvs() {
    if (this.envs.NODE_ENV === undefined) this.throw("NODE_ENV");

    if (this.envs.API_BASE_URI === undefined) this.throw("API_BASE_URI");

    if (this.envs.SERVER_ENVIRONMENT === undefined)
      this.throw("SERVER_ENVIRONMENT");
    if (this.envs.SERVER_PORT === undefined) this.throw("SERVER_PORT");
    if (this.envs.SERVER_NAME === undefined) this.throw("SERVER_NAME");
  }

  private throw(environmentName: string) {
    this.error = new EnvironmentError.EnvironmentUndefinedException(
      environmentName
    );
  }
}

export class EnvManager {
  api: {
    BASE_URI: string;
  };
  server: {
    DEPLOY: boolean;
    ENVIRONMENT: ServerEnvironmentType;
    LOGGER_PATH: string;
    LOG_ENVIRONMENT: boolean;
    NAME: string;
    NODE_ENV: NodeEnvironmentType;
    PORT: number;
    RATE_LIMIT_MAX_REQUESTS: number;
    RATE_LIMIT_WMS_MINUTES: number;
  };

  constructor() {
    const envs: PrimitiveEnvs = process.env as PrimitiveEnvs;

    this.api = {
      BASE_URI: String(envs.API_BASE_URI),
    };

    this.server = {
      DEPLOY: Parser.stringToBool(envs.DEPLOY),
      ENVIRONMENT: envs.SERVER_ENVIRONMENT as ServerEnvironmentType,
      LOGGER_PATH: String(envs.SERVER_LOGGER_PATH),
      LOG_ENVIRONMENT: Parser.stringToBool(envs.SERVER_LOG_ENVIRONMENT),
      NAME: String(envs.SERVER_NAME),
      NODE_ENV: envs.NODE_ENV as NodeEnvironmentType,
      PORT: Number(envs.SERVER_PORT),
      RATE_LIMIT_MAX_REQUESTS: Number(envs.SERVER_RATE_LIMIT_MAX_REQUESTS),
      RATE_LIMIT_WMS_MINUTES: Number(envs.SERVER_RATE_LIMIT_WMS_MINUTES),
    };
  }

  static validate() {
    return new EnvironmentValidator().validateEnvironment();
  }
}

// Load centralized env file for environment definition.
dotenv.config({
  debug: true,
  path: ".env",
});

const ENVIRONMENT = process.env.ENVIRONMENT
  ? process.env.ENVIRONMENT
  : ServerEnvironment.development;

// Load the .env configuration file
dotenv.config({
  debug: true,
  override: true,
  path: `global/.env.${ENVIRONMENT}`,
});

export const environment = new EnvManager();
