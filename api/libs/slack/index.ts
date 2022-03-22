import { App } from "@slack/bolt";

import { environment } from "@/environment";
import { Logger } from "@/libs/logger";
import { SlackError } from "./errors";

export class SlackManager {
  private app!: App;

  constructor() {}

  async init(): Promise<void> {
    try {
      // If some problem emerge, abort initialization.
      let abort = false;

      const APP_TOKEN = environment.slack.APP_TOKEN;
      const IS_ENABLED = environment.slack.IS_ENABLED;
      const PORT = environment.slack.PORT;
      const SIGNING_SECRET = environment.slack.SIGNING_SECRET;
      const TOKEN = environment.slack.TOKEN;

      if (IS_ENABLED === undefined) {
        Logger.warning(
          new SlackError.RequiredEnvironmentUndefinedFailure("IS_ENABLED")
        );

        // If this variable was not provided, directly abort configuration.
        return Logger.notice("Slack configuration aborted");
      }

      if (Boolean(IS_ENABLED)) {
        if (APP_TOKEN == undefined) {
          Logger.warning(
            new SlackError.RequiredEnvironmentUndefinedFailure("APP_TOKEN")
          );

          abort = true;
        }

        if (PORT == undefined) {
          Logger.warning(
            new SlackError.RequiredEnvironmentUndefinedFailure("PORT")
          );

          abort = true;
        }

        if (SIGNING_SECRET == undefined) {
          Logger.warning(
            new SlackError.RequiredEnvironmentUndefinedFailure("SIGNING_SECRET")
          );

          abort = true;
        }

        if (TOKEN == undefined) {
          Logger.warning(
            new SlackError.RequiredEnvironmentUndefinedFailure("TOKEN")
          );

          abort = true;
        }

        // Aborting.
        if (abort) return Logger.warning("Slack configuration aborted");

        this.app = new App({
          appToken: APP_TOKEN,
          signingSecret: SIGNING_SECRET,
          socketMode: true,
          token: TOKEN,
        });

        await this.app.start(PORT!);

        Logger.notice(`Slack configured and running on port ${PORT!}`);
      } else {
        return Logger.warning("Slack was disabled");
      }
    } catch (error) {
      Logger.error(new SlackError.InitializationFailure(error));
    }
  }

  async sendMessage(args: { channel: string; message: string }): Promise<void> {
    try {
      const { channel, message } = args;

      await this.app.client.chat.postMessage({
        channel,
        text: message,
      });
    } catch (error) {
      Logger.error(new SlackError.PostMessageFailure(error));
    }
  }
}

export const slackManager = new SlackManager();
