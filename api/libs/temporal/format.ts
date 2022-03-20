import moment, { Moment } from "moment";

export class TemporalFormat {
  static timestampReduced(date: Moment): string {
    const timestamp = moment(date).unix();

    return String(timestamp).substring(0, 8);
  }
}
