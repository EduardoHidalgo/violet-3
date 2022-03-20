import { serverApp } from "@/server";

import { Logger } from "@/libs/logger";

/* Self-invoking function to execute and start the API server. Here is the first
code file to be executed when starting the server. The "ServerApp" class is in 
charge of applying all the processes and configurations necessary to start the 
Express.js server. */
(async () => {
  try {
    Logger.notice("Starting server");

    await serverApp.init();
  } catch (error) {
    console.error(error);

    // If server fails to initialize, force aborting Node.js process.
    process.exit(1);
  }
})();
