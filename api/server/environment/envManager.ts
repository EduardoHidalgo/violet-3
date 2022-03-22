import { Parser } from "@/libs/utils/parser";
import { BaseError } from "@/core/error";

import {
  EnvVar,
  EnvironmentError,
  NodeEnvironmentType,
  ServerEnvironmentType,
} from "./types";
import { Logger } from "@/libs/logger";

/** Here you could define environment variables names and get static typing.
 * This names should be the same as used on .env file. Notice the convention
 * used on naming: [<ENV TYPE>]_<NAME TYPE>.
 */
interface PrimitiveEnvsExtension {
  readonly API_BASE_URI: EnvVar;
  readonly INFRA_IS_DEPLOY: EnvVar;
  readonly SENTRY_DSN: EnvVar;
  readonly SENTRY_IS_ENABLED: EnvVar;
  readonly SENTRY_TRACE_SAMPLES_RATE: EnvVar;
  readonly SERVER_ENVIRONMENT: EnvVar;
  readonly SERVER_LOG_ENVIRONMENT: EnvVar;
  readonly SERVER_LOG_ENVIRONMENT_VALIDATIONS: EnvVar;
  readonly SERVER_LOG_ROUTING_TREE: EnvVar;
  readonly SERVER_NAME: EnvVar;
  readonly SERVER_PORT: EnvVar;
  readonly SERVER_RATE_LIMIT_MAX_REQUESTS: EnvVar;
  readonly SERVER_RATE_LIMIT_WMS_MINUTES: EnvVar;
  readonly npm_package_version: EnvVar;
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
      // this should be validated first against alphabetical ordering due to
      // urgency usage and importance.
      this.validateServerEnvs();

      this.validateApiEnvs();
      this.validateInfraEnvs();
      this.validateSentryEnvs();

      if (this.error != null) return this.error;

      return true;
    } catch (error) {
      return new EnvironmentError.EnvironmentValidationFailure();
    }
  }

  private validateApiEnvs() {
    this.checkUndefined(this.envs.API_BASE_URI, "API_BASE_URI");
  }

  private validateInfraEnvs() {
    this.checkUndefined(this.envs.INFRA_IS_DEPLOY, "INFRA_IS_DEPLOY");
  }

  private validateSentryEnvs() {
    this.checkFloppyUndefined(this.envs.SENTRY_DSN, "SENTRY_DNS");
    this.checkFloppyUndefined(this.envs.SENTRY_IS_ENABLED, "SENTRY_IS_ENABLED");
    this.checkFloppyUndefined(
      this.envs.SENTRY_TRACE_SAMPLES_RATE,
      "SENTRY_TRACE_SAMPLES_RATE"
    );
  }

  private validateServerEnvs() {
    this.checkUndefined(this.envs.NODE_ENV, "NODE_ENV");

    this.checkUndefined(this.envs.SERVER_ENVIRONMENT, "SERVER_ENVIRONMENT");
    this.checkUndefined(
      this.envs.SERVER_LOG_ENVIRONMENT,
      "SERVER_LOG_ENVIRONMENT"
    );
    this.checkUndefined(
      this.envs.SERVER_LOG_ROUTING_TREE,
      "SERVER_LOG_ROUTING_TREE"
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
    this.checkUndefined(this.envs.npm_package_version, "npm_package_version");
  }

  private checkFloppyUndefined(env: any, name: string) {
    if (env === undefined) this.throw(name, "floppy");
  }

  private checkUndefined(env: any, name: string) {
    if (env === undefined) this.throw(name, "undefined");
  }

  private throw(environmentName: string, type: "floppy" | "undefined") {
    const logValidations = Parser.stringToBool(
      this.envs.SERVER_LOG_ENVIRONMENT_VALIDATIONS
    );

    switch (type) {
      case "floppy":
        if (logValidations)
          Logger.warning(
            new EnvironmentError.OptionalEnvironmentUndefinedException(
              environmentName
            )
          );
        break;
      case "undefined":
        this.error = new EnvironmentError.EnvironmentUndefinedException(
          environmentName
        );
        break;
    }
  }
}

/** Singleton class that transform any environment variable into typed variables.
 * Any of this type transforms should be safe if EnvironmentValidator made it
 * job correctly.
 */
export class EnvManager {
  api: {
    /** Base uri on which all API routes are built. */
    BASE_URI: string;
  };

  infra: {
    /** Boolean that determines if the current server is being deployed on some
     * infrastructure. */
    IS_DEPLOY: boolean;
  };

  sentry: {
    /** Data Source Name required for Sentry service. */
    DSN?: string;

    /** Boolean that determines if Sentry service is enabled. */
    IS_ENABLED?: boolean;

    /** Determines the ratio of traces that would be reported by monitoring. */
    TRACE_SAMPLES_RATE?: number;
  };

  server: {
    /** Personal environment of the server, associated with the system
     * environments. */
    ENVIRONMENT: ServerEnvironmentType;

    /** Boolean that determines whether environment variables should be
     * logged. */
    LOG_ENVIRONMENT: boolean;

    /** Boolean that determines whether environment soft errors should be
     * logged. */
    LOG_ENVIRONMENT_VALIDATIONS: boolean;

    /** Boolean that determines if the routing tree should be logged. */
    LOG_ROUTING_TREE: boolean;

    /** Server name for log and identification purposes. */
    NAME: string;

    /** Environment variable used for the Node.js server. */
    NODE_ENV: NodeEnvironmentType;

    /** Get package.json version of this project. Could be undefined. This
     * shouldn't be defined by any environment file, it's provided by node
     * itself.
     */
    NPM_PACKAGE_VERSION?: string;

    /** Network port on which the server runs as a backend service. */
    PORT: number;

    /** Sets the number of requests that the user has as a limit to make
     * multiple requests to the server during the window time. */
    RATE_LIMIT_MAX_REQUESTS: number;

    /** It establishes the window minutes that a user has as a limit to make
     * multiple requests to the server. */
    RATE_LIMIT_WMS_MINUTES: number;

    /** Sets the time zone used by the server to calculate dates and times,
     * according to ICANN Timezone database.
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

    this.sentry = {
      DSN: envs.SENTRY_DSN !== undefined ? String(envs.SENTRY_DSN) : undefined,
      IS_ENABLED:
        envs.SENTRY_IS_ENABLED !== undefined
          ? Parser.stringToBool(envs.SENTRY_IS_ENABLED)
          : undefined,
    };

    this.server = {
      ENVIRONMENT: envs.SERVER_ENVIRONMENT as ServerEnvironmentType,
      LOG_ENVIRONMENT: Parser.stringToBool(envs.SERVER_LOG_ENVIRONMENT),
      LOG_ENVIRONMENT_VALIDATIONS: Parser.stringToBool(
        envs.SERVER_LOG_ENVIRONMENT_VALIDATIONS
      ),
      LOG_ROUTING_TREE: Parser.stringToBool(envs.SERVER_LOG_ROUTING_TREE),
      NAME: String(envs.SERVER_NAME),
      NODE_ENV: envs.NODE_ENV as NodeEnvironmentType,
      NPM_PACKAGE_VERSION:
        envs.npm_package_version !== undefined
          ? String(envs.npm_package_version)
          : undefined,
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
