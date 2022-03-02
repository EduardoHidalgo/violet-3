import { ServerApp } from "@/server/app";

/* Self-invoking function to execute and start the API server. */
(() => {
  try {
    console.log("[SERVER] Starting server");

    const server = new ServerApp();

    server.init();
  } catch (e) {
    console.error(e);
  }
})();
