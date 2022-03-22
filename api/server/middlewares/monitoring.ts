import { Express } from "express";

import { Monitoring } from "@/libs/monitoring";

/** Monitoring middleware to obtain metrics and analytics on errors and requests
 * made to the server at all times.
 */
export function monitoringMiddleware(app: Express) {
  Monitoring.sentryConfigure(app);
}

/** Middleware that captures 4xx and 5xx errors that occurred during requests to
 * the server. It is very important that this middleware is always the last
 * middleware to be called, after all routes and controllers have been executed.
 */
export function errorMonitoringMiddleware(app: Express) {
  Monitoring.sentryErrorHandler(app);
}
