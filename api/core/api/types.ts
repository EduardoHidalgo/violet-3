/** Types of deletion operations. */
export enum DeletionTypeEnum {
  /** Delete in an unrecoverable way the information stored on persistent
   * systems, ignoring the soft deletion mark. */
  force = "force",

  /** Delete in an unrecoverable way the information stored on persistent
   * systems, but only if was marked using soft deletion type. */
  hard = "hard",

  /** Delete all records in the database without any condition, but doesn't
   * reset the autoincremental index value. */
  purge = "purge",

  /** Shy only change a boolean on database. This is used as a safe and temporal
   * deactivation of some data. */
  shy = "shy",

  /** Deactivate the data, and mark it to be deleted passed certain time. Soft
   * delete could be reverted as a mechanism to restore deleted data. */
  soft = "soft",

  /** Delete all records in the database without any condition, but reset the
   * autoincremental index value. */
  truncate = "truncate",
}

export type DeletionType = keyof typeof DeletionTypeEnum;

export const deletionTypes = Object.values(DeletionTypeEnum);

export enum ResponseTypeEnum {
  /** Specifies that the response body should return a pre-determined response
   * with all relevant and related data to the resource requested. This type of
   * response are heavy and slow. */
  aggregate = "aggregate",

  /** Could specific which root objects want to be returned. This type of
   * response should be requested alongside the "properties" query parameter,
   * where could be defined which root objects are wanted in the body request. */
  granular = "granular",

  /** Specifies that the response body should contain no response. */
  none = "none",

  /** Specifies that the response body should return a pre-determined response
   * model with minimal data. This type of response are optimized to be fast and
   * lightweight. */
  partial = "partial",

  /** Specifies that the response body should return a pre-determined response
   * model that only contains the resource data requested. This type of response
   * are the predetermined response if no type was specified in the query
   * request parameter. */
  standard = "standard",
}

/** Type of body responses that could return some endpoint. Sometimes The API's
 * consumer will want more or less information in the response depending of what
 * it needs.
 */
export type ResponseType = keyof typeof ResponseTypeEnum;

export const responseTypes = Object.values(ResponseTypeEnum);

export enum SearchTypeEnum {
  /** Retrieves all resources ignoring filters. */
  all = "all",

  /** Retrieves many resources applying filters without pagination. */
  filtered = "filtered",

  /** Retrieves many resources usually based on some relation with another
   * domain. Could apply filters, doesn't apply pagination. */
  related = "related",

  /** Retrieves many resources applying filters and pagination. */
  search = "search",
}

export type SearchType = keyof typeof SearchTypeEnum;

export const searchTypes = Object.values(SearchTypeEnum);
