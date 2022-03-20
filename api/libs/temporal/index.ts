import moment from "moment";

import { TemporalFormat } from "./format";
import { TemporalUTC } from "./utc";
import { TemporalUtils } from "./utils";

/** Internal class in charge of handling all date, timezone and time operations
 * for having a consistent usage. This class doesn't require initialization, all
 * operations are static.
 *
 * Notice errors use console.error instead Logger class to prevent infinite loop
 * call.
 *
 * Notice: You should be aware of the difference between Timezone and Offset.
 * @link https://spin.atomicobject.com/2016/07/06/time-zones-offsets
 *
 */
export class Temporal {
  static format = TemporalFormat;
  static utc = TemporalUTC;
  static utils = TemporalUtils;

  static now() {
    return moment();
  }
}
