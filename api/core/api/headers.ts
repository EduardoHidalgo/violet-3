/** Common interface that should be extended by authentication schema validators.
 */
export interface AuthorizationHeaders {
  authorization?: string;
}

/** Common interface that should be extended when some endpoint has to update or
 * create something. The userResponsibleId header gives a trace of who requested
 * the change and is required to update metadata. */
export interface StoreHeaders {
  "responsible-id"?: string;
}

/** Common interface that should be extended when some endpoint could provide
 * some resource in many languages. */
export interface LanguageHeaders {
  language?: string;
}
