import { Express } from "express";

import { BaseError } from "@/core/error";
import { SentryMonitoring } from "./sentry";

export class Monitoring {
  static sentryConfigure = (app: Express) => SentryMonitoring.configure(app);

  static sentryErrorHandler = (app: Express) =>
    SentryMonitoring.errorHandler(app);

  static sentryThrowMonitorException = (error: BaseError) =>
    SentryMonitoring.throwMonitorException(error);
}
