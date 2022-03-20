import moment, { Moment } from "moment";

// TODO add comments
export class TemporalFormat {
  /** Returns a unix timestamp string with only the first 8 digits, for logs and
   * string format usage.
   *
   * @param date Moment date (in UTC preferred).
   * @returns a 8 digit timestamp string.
   */
  static timestampReduced(date: Moment): string {
    const timestamp = moment(date).unix();

    return String(timestamp).substring(0, 8);
  }
}
