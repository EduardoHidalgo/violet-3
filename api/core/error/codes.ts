export enum SuccessCode {
  /** Standard response for successful HTTP requests. The actual response will
   * depend on the request method used. In a GET request, the response will
   * contain an entity corresponding to the requested resource. In a POST
   * request the response will contain an entity describing or containing the
   * result of the action. */
  "OK" = 200,

  /** Successful creation occurred (via either POST or PUT). Set the Location
   * header to contain a link to the newly-created resource (on POST). Response
   * body content may or may not be present. */
  "CREATED" = 201,

  /** The request has been accepted for processing, but the processing has not
   * been completed. The request might or might not eventually be acted upon, as
   * it might be disallowed when processing actually takes place. */
  "ACCEPTED" = 202,

  /** The server successfully processed the request, but is not returning any
   * content. */
  "NO-CONTENT" = 204,

  /** The server is delivering only part of the resource due to a range header
   * sent by the client. The range header is used by tools like wget to enable
   * resuming of interrupted downloads, or split a download into multiple
   * simultaneous streams. */
  "PARTIAL-CONTENT" = 206,
}

export enum ApiErrorCode {
  /** The request cannot be fulfilled due to bad syntax. */
  "BAD-REQUEST" = 400,

  /** Similar to 403 Forbidden, but specifically for use when authentication is
   * possible but has failed or not yet been provided. */
  "UNAUTHORIZED" = 401,

  /** The request was a legal request, but the server is refusing to respond to
   * it. Unlike a 401 Unauthorized response, authenticating will make no
   * difference. */
  "FORBIDDEN" = 403,

  /** The requested resource could not be found but may be available again in
   * the future. Subsequent requests by the client are permissible. */
  "NOT-FOUND" = 404,

  /** A request was made of a resource using a request method not supported
   * by that resource. */
  "METHOD NOT ALLOWED" = 405,

  /** The requested resource is only capable of generating content not
   * acceptable according to the Accept headers sent in the request. */
  "NOT-ACCEPTABLE" = 406,

  /** Indicates that the request could not be processed because of conflict in
   * the request, such as an edit conflict. */
  "CONFLICT" = 409,
}

export enum ServerErrorCode {
  /** A generic error message, given when no more specific message is suitable. */
  "INTERNAL-SERVER-ERROR" = 500,

  /** The server either does not recognise the request method, or it lacks the
   * ability to fulfill the request. */
  "NOT-IMPLEMENTED" = 501,

  /** The server is currently unavailable (because it is overloaded or down
   * for maintenance). Generally, this is a temporary state. */
  "SERVICE-UNAVAILABLE" = 503,
}

export type HttpCode = SuccessCode | ApiErrorCode | ServerErrorCode;
