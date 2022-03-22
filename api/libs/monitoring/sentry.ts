import { Express, ErrorRequestHandler, RequestHandler } from "express";
import { RewriteFrames } from "@sentry/integrations";
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";

import { environment, ServerEnvironment } from "@/environment";
import { BaseError } from "@/core/error";
import { Logger } from "@/libs/logger";
import { MonitoringError } from "./errors";

export class SentryMonitoring {
  static configure(app: Express): void {
    try {
      // If some problem emerge, abort sentry initialization.
      let abort = false;

      const DSN = environment.sentry.DSN;
      const ENVIRONMENT = environment.server.ENVIRONMENT;
      const IS_ENABLED = environment.sentry.IS_ENABLED;
      const PACKAGE_VERSION = environment.server.NPM_PACKAGE_VERSION;
      const SERVER_NAME = environment.server.NAME;
      const TRACE_SAMPLES_RATE = environment.sentry.TRACE_SAMPLES_RATE;

      // Endpoints excludable.
      const traceExcludes = ["GET /"];
      // Whitelist for endpoints starting with.
      const traceWhitelist = ["/api"];

      if (IS_ENABLED === undefined) {
        Logger.warning(
          new MonitoringError.Sentry.RequiredEnvironmentUndefinedFailure(
            "IS_ENABLED"
          )
        );

        // If this variable was not provided, directly abort configuration.
        return Logger.notice("SentryMonitoring configuration aborted");
      }

      if (Boolean(IS_ENABLED)) {
        if (DSN == undefined) {
          Logger.warning(
            new MonitoringError.Sentry.RequiredEnvironmentUndefinedFailure(
              "DSN"
            )
          );

          abort = true;
        }

        if (PACKAGE_VERSION == undefined) {
          Logger.warning(
            new MonitoringError.Sentry.RequiredEnvironmentUndefinedFailure(
              "PACKAGE_VERSION"
            )
          );

          abort = true;
        }

        if (TRACE_SAMPLES_RATE == undefined) {
          Logger.warning(
            new MonitoringError.Sentry.RequiredEnvironmentUndefinedFailure(
              "TRACE_SAMPLES_RATE"
            )
          );

          abort = true;
        }

        // Aborting.
        if (abort)
          return Logger.warning("SentryMonitoring configuration aborted");

        Logger.notice("SentryMonitoring traceExcludes:", traceExcludes);
        Logger.notice("SentryMonitoring traceWhitelist:", traceWhitelist);

        Sentry.init({
          attachStacktrace: true,
          autoSessionTracking: false,
          debug: ENVIRONMENT !== ServerEnvironment.production ? true : false,
          dsn: DSN,
          environment: ENVIRONMENT,
          integrations: [
            // Enable HTTP calls tracing
            new Sentry.Integrations.Http({ tracing: true }),
            // Enable Express.js middleware tracing
            new Tracing.Integrations.Express({ app }),
            // Some workaround for Express.js.
            new RewriteFrames({
              root: process.cwd(),
            }),
          ],
          // String identifier for each release version.
          release: `${SERVER_NAME}@${PACKAGE_VERSION}`,
          // Set tracesSampleRate to 1.0 to capture 100% of transactions for
          // performance monitoring. We recommend adjusting this value in
          // production.
          tracesSampleRate: TRACE_SAMPLES_RATE,
          // Prevent to trace constant healthcheck request from GCP and hack
          // requests.
          tracesSampler: (samplingContext) => {
            // Ignore all traces if local environment.
            if (ENVIRONMENT === ServerEnvironment.local) return false;

            // WARNING! this if's are very important! Typescript compilation
            // will crash without this validations because samplingContext could
            // be null.
            if (samplingContext != null)
              if (samplingContext.transactionContext != null) {
                const context = samplingContext.transactionContext.name;

                // Check if some specific trace match with traceExcludes list.
                if (traceExcludes.some((trace) => trace == context))
                  return false;

                // Check if the trace contains some substring for traceWhitelist
                // list. Accepts traces that doesn't match any of the list
                // values.
                if (traceWhitelist.some((trace) => context.includes(trace)))
                  return true;
                else return false;
              }

            // Provide a tracing if any condition was met.
            return true;
          },
        });

        // RequestHandler creates a separate execution context using domains, so
        // that every transaction/span/breadcrumb is attached to its own Hub
        // instance.
        app.use(Sentry.Handlers.requestHandler() as RequestHandler);

        // TracingHandler creates a trace for every incoming request.
        app.use(Sentry.Handlers.tracingHandler());

        return;
      } else {
        return Logger.warning("SentryMonitoring was disabled");
      }
    } catch (error) {
      throw new MonitoringError.Sentry.UndefinedFailure(error);
    }
  }

  /** This Sentry error handler must be called before any other error
   * middleware and after all controllers and routing call.
   *
   * @param app Express.js instance.
   */
  static errorHandler(app: Express): void {
    if (environment.sentry.IS_ENABLED) {
      app.use(
        Sentry.Handlers.errorHandler({
          shouldHandleError(error) {
            // ignore error catching on local environment.
            if (environment.server.ENVIRONMENT === ServerEnvironment.local)
              return false;

            // Capture all 4xx and 5xx errors.
            if (error.status != undefined)
              if (error.status >= 400 && error.status <= 599) return true;

            return false;
          },
        }) as ErrorRequestHandler
      );
    }
  }

  /** Execute Sentry error capturing on each error. How or when error are
   * catched is not a concern of this function.
   *
   * @param error Error object.
   * @returns Sentry eventId.
   */
  static throwMonitorException(error: BaseError): string | null {
    try {
      if (environment.sentry.IS_ENABLED) return Sentry.captureException(error);
      else return null;
    } catch (error) {
      console.error(error);

      return null;
    }
  }
}
