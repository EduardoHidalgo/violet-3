import { ApiRouter, MainRouterFn } from "@/core/routes";

import { VersionSwitchOne } from "@/api/routes/v1";
import { VersionSwitchTwo } from "@/api/routes/v2";

type Domains = VersionSwitchOne.Domains | VersionSwitchTwo.Domains;

type Routes = VersionSwitchOne.Routes | VersionSwitchTwo.Routes;

export const mainRouter: MainRouterFn = (app) => {
  const apiRouter = new ApiRouter<Domains, Routes>({
    app,
  });

  VersionSwitchOne.router(apiRouter);
  VersionSwitchTwo.router(apiRouter);

  apiRouter.turnOn();
};
