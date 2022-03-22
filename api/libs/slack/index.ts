import { App } from "@slack/bolt";

import { environment } from "@/environment";
import { Logger } from "@/libs/logger";
import { SlackError } from "./errors";

enum SlackChannel {
  logging = "logging",
}

type SlackChannelType = keyof typeof SlackChannel;

export class SlackManager {
  private app!: App;
  private initializated: boolean = false;

  private channels = {
    logging: "",
  };

  constructor() {}

  async init(): Promise<void> {
    try {
      // If some problem emerge, abort initialization.
      let abort = false;

      const APP_TOKEN = environment.slack.APP_TOKEN;
      const CHANNEL_LOGGING = environment.slack.CHANNEL_LOGGING;
      const IS_ENABLED = environment.slack.IS_ENABLED;
      const PORT = environment.slack.PORT;
      const SIGNING_SECRET = environment.slack.SIGNING_SECRET;
      const TOKEN = environment.slack.TOKEN;
      const USE_FOR_LOGGING = environment.slack.USE_FOR_LOGGING;

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

        if (CHANNEL_LOGGING == undefined) {
          Logger.warning(
            new SlackError.RequiredEnvironmentUndefinedFailure(
              "CHANNEL_LOGGING"
            )
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

        this.channels.logging = String(CHANNEL_LOGGING);

        await this.app.start(PORT!);
        this.initializated = true;

        if (USE_FOR_LOGGING !== undefined || USE_FOR_LOGGING!)
          Logger.warning("Slack as logging service was disabled");

        Logger.notice(`Slack configured and running on port ${PORT!}`);
      } else {
        Logger.warning("Slack was disabled");

        if (USE_FOR_LOGGING !== undefined || USE_FOR_LOGGING!)
          Logger.warning("Slack as logging service was disabled");
      }
    } catch (error) {
      Logger.error(new SlackError.InitializationFailure(error));
    }
  }

  async setChannels() {}

  async sendMessage(args: {
    channelType: SlackChannelType;
    message: string;
    isErrorLooping: boolean;
  }): Promise<void> {
    if (this.initializated)
      try {
        const { channelType, message } = args;

        let channel = "";
        switch (channelType) {
          case "logging":
            channel = this.channels.logging;
            break;
          default:
            return;
        }

        await this.app.client.chat.postMessage({
          channel,
          text: message,
        });
      } catch (error) {
        // Prevents infinite loop using on logging.
        if (args.isErrorLooping) console.error(error);
        else Logger.error(new SlackError.PostMessageFailure(error));
      }
  }
}

export const slackManager = new SlackManager();
