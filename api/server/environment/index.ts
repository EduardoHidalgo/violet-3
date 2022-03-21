import dotenv from "dotenv";

import { EnvManager } from "./envManager";
import { ServerEnvironment } from "./types";

// Load centralized env file for environment definition.
dotenv.config({
  debug: true,
  path: "global/environments/.env",
});

const ENVIRONMENT = process.env.ENVIRONMENT
  ? process.env.ENVIRONMENT
  : ServerEnvironment.development;

// Load the .env configuration file according to environment type.
dotenv.config({
  debug: true,
  override: true,
  path: `global/environments/.env.${ENVIRONMENT}`,
});

export const environment = new EnvManager();

export { EnvManager };
