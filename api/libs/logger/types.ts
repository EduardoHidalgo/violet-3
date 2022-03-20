export enum LogColor {
  Reset = "\x1b[0m",
  Bright = "\x1b[1m",
  Dim = "\x1b[2m",
  Underscore = "\x1b[4m",
  Blink = "\x1b[5m",
  Reverse = "\x1b[7m",
  Hidden = "\x1b[8m",

  FgBlack = "\x1b[30m",
  FgRed = "\x1b[31m",
  FgGreen = "\x1b[32m",
  FgYellow = "\x1b[33m",
  FgBlue = "\x1b[34m",
  FgMagenta = "\x1b[35m",
  FgCyan = "\x1b[36m",
  FgWhite = "\x1b[37m",

  BgBlack = "\x1b[40m",
  BgRed = "\x1b[41m",
  BgGreen = "\x1b[42m",
  BgYellow = "\x1b[43m",
  BgBlue = "\x1b[44m",
  BgMagenta = "\x1b[45m",
  BgCyan = "\x1b[46m",
  BgWhite = "\x1b[47m",
}

export type LogColorType = keyof typeof LogColor;

export enum LoggerLevel {
  /** (600) A person must take an action immediately. */
  ALERT = "ALERT",

  /** (700) Critical events cause more severe problems or outages. */
  CRITICAL = "CRITICAL",

  /** (100) Debug or trace information. */
  DEBUG = "DEBUG",

  /** (0) The log entry has no assigned severity level. */
  DEFAULT = "DEFAULT",

  /** (800) One or more systems are unusable. */
  EMERGENCY = "EMERGENCY",

  /** (500) Error events are likely to cause problems. */
  ERROR = "ERROR",

  /** (200) Routine information, such as ongoing status or performance. */
  INFO = "INFO",

  /** (300) Normal but significant events, such as start up, shut down, or a
   * configuration change. */
  NOTICE = "NOTICE",

  /** (400) Warning events might cause problems. */
  WARNING = "WARNING",
}

export type LoggerLevelType = keyof typeof LoggerLevel;
