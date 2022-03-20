import moment, { Moment } from "moment";

export class TemporalUTC {
  static now(): Moment {
    return moment().utc(false);
  }
}
