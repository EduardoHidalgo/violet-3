import { Request, Response } from "express";
import { IncomingHttpHeaders } from "http";
import * as core from "express-serve-static-core";

import { BaseError } from "@/core/error";

/** Common interface that defines the API request types that should be provided
 * to Infrastructure Layer. All data is obtained for the Express {@link
 * Express.Request Request} object. Read {@link https://expressjs.com/es/api.html#req}
 * to know more about.
 *
 * @template Body Request Object sended through the body as a Content-Type data
 * payload.
 * @template Headers Http request data usually related to transport-level of a
 * connection.
 * @template Params URI Params values extracted from the uri string.
 * @template Query Any optional URI parameter forward the path section of a URI.
 * Read {@link https://en.wikipedia.org/wiki/Uniform_Resource_Identifier} to
 * know more about URI construction.
 */
export interface ApiRequest<Body, Headers, Params, Query> {
  body: Body;
  headers: Headers;
  params: Params;
  query: Query;
}

/** Common interface that defines the base URI params which all API requests
 * should have. Also defines the shape of all params' interfaces.
 *
 * @extends core.ParamsDictionary {@link core.ParamsDictionary}
 */
export interface ParamsBase extends core.ParamsDictionary {}

/** Common interface that defines the base query parameters which all API
 * requests should have. Also defines the shape of all query's interfaces.
 *
 * @extends core.Query {@link core.Query}
 */
export interface QueryBase extends core.Query {}

/**  Common interface that defines the base headers which all API requests
 * should have. Also defines the shape of all headers' interfaces.
 *
 * @extends IncomingHttpHeaders {@link IncomingHttpHeaders}
 */
export interface HeadersBase extends IncomingHttpHeaders {}

/** Common interface that defines the shape of all API request data. This
 * hyper-typed interface provide a properly typed inference of all data that
 * could be received by a endpoint.
 *
 * @extends express.Request {@link Request}
 */
export interface RequestBase<
  Body = void,
  Headers extends HeadersBase = IncomingHttpHeaders,
  Params extends ParamsBase = core.ParamsDictionary,
  Response = void,
  Query = QueryBase
> extends Request<Params, Response, Body, Query, Headers> {
  headers: HeadersBase & Headers;
}

/** Common interface that defines the response type which all API requests
 * should have. Also defines the shape of all responses' interfaces.
 *
 * @template Dto Data Transfer Object returned as response.
 * @type BaseError {@link BaseError}
 *
 * @extends Response<Dto|BaseError> {@link Response}
 */
export interface ResponseBase<Dto>
  extends Response<
    Dto | EmptyCollection<Dto> | EmptyDocument<Dto> | BaseError
  > {}

/** Typed that represents the result of an endpoint in the form of a list.
 */
export type EmptyCollection<T> = T[];

/** Typed that represents the result of an endpoint in the form of a object.
 */
export type EmptyDocument<T> = T | Empty;

/** Typed that represents the result of an endpoint in the form of an empty
 * result.
 */
export type Empty = void;
