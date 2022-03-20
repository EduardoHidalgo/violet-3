import express, { Express } from "express";

import { Logger } from "@/libs/logger";

/** Middleware that only parses json and only looks at requests where the
 * Content-Type header matches the type option.
 */
export function parserMiddleware(app: Express): void {
  app.use(express.json());

  Logger.notice("parserMiddleware configured");
}
