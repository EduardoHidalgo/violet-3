import express, { Express } from "express";

/** Middleware that only parses json and only looks at requests where the
 * Content-Type header matches the type option.
 */
export function parserMiddleware(app: Express): void {
  app.use(express.json());
}
