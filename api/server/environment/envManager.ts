import { Parser } from "@/libs/utils/parser";
import { BaseError } from "@/core/error";
import {
  EnvVar,
  EnvironmentError,
  NodeEnvironmentType,
  ServerEnvironmentType,
} from "./types";

/** Here you could define environment variables names and get static typing.
 * This names should be the same as used on .env file. Notice the convention
 * used on naming: [<ENV TYPE>]_<NAME TYPE>.
 */
interface PrimitiveEnvsExtension {
  readonly API_BASE_URI: EnvVar;
  readonly INFRA_IS_DEPLOY: EnvVar;
  readonly SERVER_ENVIRONMENT: EnvVar;
  readonly SERVER_ENV_DEBUG: EnvVar;
  readonly SERVER_LOG_ENVIRONMENT: EnvVar;
  readonly SERVER_NAME: EnvVar;
  readonly SERVER_PORT: EnvVar;
  readonly SERVER_RATE_LIMIT_MAX_REQUESTS: EnvVar;
  readonly SERVER_RATE_LIMIT_WMS_MINUTES: EnvVar;
}

type PrimitiveEnvs = NodeJS.ProcessEnv & PrimitiveEnvsExtension;

class EnvironmentValidator {
  private envs: PrimitiveEnvs;
  private error: BaseError | null;

  constructor() {
    this.envs = process.env as PrimitiveEnvs;
    this.error = null;
  }

  validate() {
    try {
      this.validateApiEnvs();
      this.validateInfraEnvs();
      this.validateServerEnvs();

      if (this.error != null) return this.error;

      return true;
    } catch (error) {
      return new EnvironmentError.EnvironmentValidatorFailure();
    }
  }

  private validateApiEnvs() {
    this.checkUndefined(this.envs.API_BASE_URI, "API_BASE_URI");
  }

  private validateInfraEnvs() {
    this.checkUndefined(this.envs.INFRA_IS_DEPLOY, "INFRA_IS_DEPLOY");
  }

  private validateServerEnvs() {
    this.checkUndefined(this.envs.NODE_ENV, "NODE_ENV");

    this.checkUndefined(this.envs.SERVER_ENVIRONMENT, "SERVER_ENVIRONMENT");
    this.checkUndefined(this.envs.SERVER_ENV_DEBUG, "SERVER_ENV_DEBUG");
    this.checkUndefined(
      this.envs.SERVER_LOG_ENVIRONMENT,
      "SERVER_LOG_ENVIRONMENT"
    );
    this.checkUndefined(this.envs.SERVER_NAME, "SERVER_NAME");
    this.checkUndefined(this.envs.SERVER_PORT, "SERVER_PORT");
    this.checkUndefined(
      this.envs.SERVER_RATE_LIMIT_MAX_REQUESTS,
      "SERVER_RATE_LIMIT_MAX_REQUESTS"
    );
    this.checkUndefined(
      this.envs.SERVER_RATE_LIMIT_WMS_MINUTES,
      "SERVER_RATE_LIMIT_WMS_MINUTES"
    );
    this.checkUndefined(this.envs.TZ, "TZ");
  }

  private checkUndefined(env: any, name: string) {
    if (env === undefined) this.throw(name);
  }

  private throw(environmentName: string) {
    this.error = new EnvironmentError.EnvironmentUndefinedException(
      environmentName
    );
  }
}

/** Singleton class that transform any environment variable into typed variables.
 * Any of this type transforms should be safe if EnvironmentValidator made it
 * job correctly.
 */
export class EnvManager {
  api: {
    BASE_URI: string;
  };
  infra: {
    IS_DEPLOY: boolean;
  };
  server: {
    ENVIRONMENT: ServerEnvironmentType;
    LOG_ENVIRONMENT: boolean;
    NAME: string;
    NODE_ENV: NodeEnvironmentType;
    PORT: number;
    RATE_LIMIT_MAX_REQUESTS: number;
    RATE_LIMIT_WMS_MINUTES: number;

    /** According to ICANN Timezone database.
     * @link https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
     */
    TIMEZONE: string;
  };

  constructor() {
    const envs: PrimitiveEnvs = process.env as PrimitiveEnvs;

    this.api = {
      BASE_URI: String(envs.API_BASE_URI),
    };

    this.infra = {
      IS_DEPLOY: Parser.stringToBool(envs.INFRA_IS_DEPLOY),
    };

    this.server = {
      ENVIRONMENT: envs.SERVER_ENVIRONMENT as ServerEnvironmentType,
      LOG_ENVIRONMENT: Parser.stringToBool(envs.SERVER_LOG_ENVIRONMENT),
      NAME: String(envs.SERVER_NAME),
      NODE_ENV: envs.NODE_ENV as NodeEnvironmentType,
      PORT: Number(envs.SERVER_PORT),
      RATE_LIMIT_MAX_REQUESTS: Number(envs.SERVER_RATE_LIMIT_MAX_REQUESTS),
      RATE_LIMIT_WMS_MINUTES: Number(envs.SERVER_RATE_LIMIT_WMS_MINUTES),
      TIMEZONE: String(envs.TZ),
    };
  }

  static validate() {
    return new EnvironmentValidator().validate();
  }
}
