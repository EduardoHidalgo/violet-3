import moment, { Moment } from "moment";

// TODO add comments
export class TemporalUTC {
  // TODO add comments
  static now(): Moment {
    return moment().utc(false);
  }
}
