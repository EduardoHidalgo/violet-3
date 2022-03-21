import { path } from "app-root-path";

import { FileWriter } from "@/libs/utils/fileWriter";
import { LogColor, LogColorType, LoggerLevel } from "@/libs/logger/types";
import { Temporal } from "@/libs/temporal";

/** Specialized internal logging service. Generates optimized logs for each
 * logging case. During development, it generates logs in the console, applying
 * colors to highlight the severity. All logs include labels that characterize
 * them, useful for filters and log searches. Additionally, it manages the
 * communication of the logs to other channels such as third-party logging and
 * monitoring services, logs in physical files, etc.
 *
 * {@link LoggerLevel} levels are based on GCP Monitoring levels. The codes
 * associated are not related in any form with the http status codes used on
 * API responses. This are numeric codes to identify and catalog server logs.
 *
 * @example
 * // Code 0 - Default.
 * Logger.log("log message");
 *
 * // Code 100 - Debug.
 * Logger.debug("log message");
 *
 * // Code 200 - Info.
 * Logger.info("log message");
 *
 * // Code 300 - Notice.
 * Logger.notice("log message");
 *
 * // Code 400 - Warning.
 * Logger.warning("log message");
 *
 * // Code 500 - Error.
 * Logger.error("log message");
 *
 * // Code 600 - Alert.
 * Logger.alert("log message");
 *
 * // Code 700 - Critical.
 * Logger.critical("log message");
 *
 * // Code 800 - Emergency.
 * Logger.emergency("log message");
 */
class Logger {
  private static fw: FileWriter = new FileWriter();
  private static path = "./logs";

  /** (600) A person must take an action immediately.
   *
   * @param message Any type of data to log.
   * @param optionalMessages Optional array of any types of data lo log.
   */
  static alert = (message: any, ...optionalMessages: any[]): void =>
    this.executeLog(
      LoggerLevel.ALERT,
      ["FgWhite", "BgRed"],
      message,
      optionalMessages
    );

  /** (700) Critical events cause more severe problems or outages.
   *
   * @param message Any type of data to log.
   * @param optionalMessages Optional array of any types of data lo log.
   */
  static critical = (message: any, ...optionalMessages: any[]): void =>
    this.executeLog(LoggerLevel.CRITICAL, "FgRed", message, optionalMessages);

  /** (100) Debug or trace information.
   *
   * @param message Any type of data to log.
   * @param optionalMessages Optional array of any types of data lo log.
   */
  static debug = (message: any, ...optionalMessages: any[]): void =>
    this.executeLog(LoggerLevel.DEBUG, "FgWhite", message, optionalMessages);

  /** (800) One or more systems are unusable.
   *
   * @param message Any type of data to log.
   * @param optionalMessages Optional array of any types of data lo log.
   */
  static emergency = (message: any, ...optionalMessages: any[]): void =>
    this.executeLog(
      LoggerLevel.EMERGENCY,
      ["FgWhite", "BgRed"],
      message,
      optionalMessages
    );

  /** (500) Error events are likely to cause problems.
   *
   * @param message Any type of data to log.
   * @param optionalMessages Optional array of any types of data lo log.
   */
  static error = (message: any, ...optionalMessages: any[]): void =>
    this.executeLog(LoggerLevel.ERROR, "FgRed", message, optionalMessages);

  /** (200) Routine information, such as ongoing status or performance.
   *
   * @param message Any type of data to log.
   * @param optionalMessages Optional array of any types of data lo log.
   */
  static info = (message: any, ...optionalMessages: any[]): void =>
    this.executeLog(LoggerLevel.INFO, "FgMagenta", message, optionalMessages);

  /** (0) The log entry has no assigned severity level.
   *
   * @param message Any type of data to log.
   * @param optionalMessages Optional array of any types of data lo log.
   */
  static log = (message: any, ...optionalMessages: any[]): void =>
    this.executeLog(LoggerLevel.DEFAULT, "FgWhite", message, optionalMessages);

  /** (300) Normal but significant events, such as start up, shut down, or a
   * configuration change.
   *
   * @param message Any type of data to log.
   * @param optionalMessages Optional array of any types of data lo log.
   */
  static notice = (message: any, ...optionalMessages: any[]): void =>
    this.executeLog(LoggerLevel.NOTICE, "FgCyan", message, optionalMessages);

  /** (400) Warning events might cause problems.
   *
   * @param message Any type of data to log.
   * @param optionalMessages Optional array of any types of data lo log.
   */
  static warning = (message: any, ...optionalMessages: any[]): void =>
    this.executeLog(LoggerLevel.WARNING, "FgYellow", message, optionalMessages);

  /** Execute all logs processes.
   *
   * @param level Level of de Logger Severity.
   * @param colors Colors used when logging on console.
   * @param message Log string.
   * @param optionalMessages Subsequent log strings.
   */
  private static executeLog(
    level: LoggerLevel,
    colors: LogColorType | LogColorType[],
    message: any,
    optionalMessages?: any[]
  ): void {
    const tag = `[${level}] `;
    const log = this.buildLog(tag, message, optionalMessages);

    this.logOnConsole(log, colors);
    this.logOnFile(log);
  }

  /** Parse complex data types like Object or Array.
   *
   * @param msg Log string.
   */
  private static stringify(msg: any): string {
    if (typeof msg == "string") return msg;

    return msg instanceof Object || msg instanceof Array
      ? JSON.stringify(msg)
      : (msg.toString() as string);
  }

  /** Apply colors to log string.
   *
   * @param colors List of colors to apply on log string.
   */
  private static applyColors(colors: LogColorType | LogColorType[]): string {
    let colorized: string = "";

    if (Array.isArray(colors))
      colors.forEach((c) => (colorized += LogColor[c]));
    else colorized += LogColor[colors];

    return colorized;
  }

  /** Concatenate tag and optionalMessages with message on a single log string.
   *
   * @param tag LoggerLevel string tag.
   * @param message Log string.
   * @param optionalMessages Optional array of any types of data lo log.
   * @returns
   */
  private static buildLog(
    tag: string,
    message?: any,
    optionalMessages?: any[]
  ): string {
    let log = `${tag}${this.stringify(message)}`;

    if (optionalMessages)
      if (optionalMessages.length > 0) {
        (optionalMessages[0] as Array<any>).forEach(
          (om) => (log += `${this.stringify(om)}`)
        );
      }

    return log;
  }

  /** Print a colored log on the debbuging console.
   *
   * @param log Log string.
   * @param colors Printing colors.
   */
  private static logOnConsole(
    log: string,
    colors: LogColorType | LogColorType[]
  ): void {
    log = this.applyColors(colors) + log;
    log += LogColor.Reset;

    console.log(log);
  }

  /** Store a log register on a file.
   *
   * @param log Log string.
   */
  private static logOnFile(log: string): void {
    try {
      const date = Temporal.now();
      const timestamp = Temporal.format.timestampReduced(date);

      const fileName = `${timestamp}.log`;

      if (path !== undefined)
        this.fw.appendFile({
          data: `\n${log}`,
          path: this.path,
          fileName,
        });
    } catch (error) {
      // Notice usage of console.error instead Logger class to prevent infinite
      // loop call.
      console.error(error);
    }
  }
}

export { Logger };
