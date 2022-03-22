import { slackManager } from "@/libs/slack";

export async function slackMiddleware(): Promise<void> {
  await slackManager.init();
}
