import type { ValidationType, YelixValidationBase } from "@/mod.ts";
import type { AllowedLicenses } from "../Core/index.ts";

type OpenAPIMethods = "POST" | "GET" | "PUT" | "DELETE" | "PATCH" | "OPTIONS";

// Represents the root document object of the OpenAPI specification.
// https://spec.openapis.org/oas/v3.1.0.html

/**
 * Represents the root document object of the OpenAPI specification.
 *
 * @property openapi - REQUIRED. Version number of the OpenAPI Specification used.
 * @property info - REQUIRED. Metadata about the API.
 * @property jsonSchemaDialect - URI indicating the default value for the $schema keyword within Schema Objects.
 * @property servers - Array of Server Objects providing connectivity information to target servers.
 * @property paths - Available paths and operations for the API.
 * @property webhooks - Incoming webhooks that may be received as part of the API.
 * @property componenets - Element holding various schemas for the document.
 * @property security - Declaration of security mechanisms available across the API.
 * @property tags - List of tags with additional metadata used by the document.
 * @property externalDocs - Additional external documentation.
 *
 * @see https://spec.openapis.org/oas/v3.1.0.html#openapi-object
 */
type OpenAPI = {
  openapi: string;
  info: OpenAPIInfo;
  jsonSchemaDialect?: string;
  servers?: OpenAPIServer[];
  paths?: Record<string, OpenAPIPathItem | OpenAPIReference>;
  webhooks?: Record<string, OpenAPIPathItem | OpenAPIReference>;
  componenets?: OpenAPIComponents;
  security?: SecurityRequirement;
  tags?: OpenAPITag[];
  externalDocs?: OpenAPIExternalDocs;
};

/**
 * Represents a Security Requirement Object in OpenAPI specification.
 */
type SecurityRequirement = Record<string, string[]>;

/**
 * Represents the OpenAPI Info Object, providing metadata about the API.
 *
 * @see {@link https://swagger.io/specification/#info-object Info Object specification}
 *
 * @typedef {Object} OpenAPIInfo
 * @property {string} title - REQUIRED. The title of the API.
 * @property {string} [summary] - A short summary of the API.
 * @property {string} [description] - A description of the API. CommonMark syntax MAY be used for rich text representation.
 * @property {string} [termsOfService] - A URL to the Terms of Service for the API. Must be a valid URL.
 * @property {OpenAPIContact} [contact] - The contact information for the exposed API.
 * @property {OpenAPILicense} [license] - The license information for the exposed API.
 * @property {string} version - REQUIRED. The version of the OpenAPI document (distinct from the OpenAPI Specification version or API implementation version).
 */
type OpenAPIInfo = {
  title: string;
  summary?: string;
  description?: string;
  termsOfService?: string;
  contact?: OpenAPIContact;
  license?: OpenAPILicense;
  version: string;
};

/**
 * Contact information for the exposed API.
 *
 * @property {string} [name] - The identifying name of the contact person/organization.
 * @property {string} [url] - The URL pointing to the contact information. MUST be in the form of a URL.
 * @property {string} [email] - The email address of the contact person/organization. MUST be in the form of an email address.
 *
 * @see https://spec.openapis.org/oas/v3.1.0#contact-object
 */
type OpenAPIContact = {
  name?: string;
  url?: string;
  email?: string;
};

/**
 * Represents a license in an OpenAPI document.
 * @property name - REQUIRED. The license name used for the API.
 * @property identifier - An [SPDX-Licenses] expression for the API. Mutually exclusive with the url field.
 * @property url - A URL to the license used for the API. Must be in the form of a URL. Mutually exclusive with the identifier field.
 * @see https://spdx.org/licenses/
 */
type OpenAPILicense = {
  name: string;
  identifier?: AllowedLicenses;
  url?: string;
};

/**
 * Represents a Server object in the OpenAPI specification.
 *
 * @example
 * ```json
 * {
 *   "url": "https://development.gigantic-server.com/v1",
 *   "description": "Development server"
 * }
 * ```
 *
 * @property url - A URL to the target host. Supports server variables and may be relative to indicate
 *                that the host location is relative to where the OpenAPI document is being served.
 *                Variable substitutions are made when a variable is named in {brackets}.
 * @property description - Optional string describing the host designated by the URL.
 *                        Supports CommonMark syntax for rich text representation.
 * @property variables - A map between variable names and their values. These values are used for
 *                      substitution in the server's URL template.
 */
type OpenAPIServer = {
  url: string;
  description?: string;
  variables?: Record<string, OpenAPIServerVariable>;
};

/**
 * An object representing a Server Variable in OpenAPI specification.
 * This is used for variable substitution in the server's URL template.
 * @example
 * {
 *   "port": {
 *     "enum": ["8443", "443"],
 *     "default": "8443"
 *   }
 * }
 * @property {string[]} [enum] - An enumeration of string values to be used if the substitution options are from a limited set.
 * @property {string} default - The default value to use for substitution, which SHALL be sent if an alternate value is not supplied.
 * @property {string} [description] - An optional description for the server variable. [CommonMark](https://commonmark.org/) syntax MAY be used for rich text representation.
 */
type OpenAPIServerVariable = {
  enum?: string[];
  default: string;
  description?: string;
};

/**
 * Holds reusable OpenAPI Components as defined in the OpenAPI Specification.
 * @see https://spec.openapis.org/oas/latest.html#components-object
 *
 * @property {Record<string, OpenAPISchema>} [schemas] - Reusable Schema Objects.
 * @property {Record<string, OpenAPIResponse | OpenAPIReference>} [responses] - Reusable Response Objects.
 * @property {Record<string, OpenAPIParameter>} [parameters] - Reusable Parameter Objects.
 * @property {Record<string, OpenAPIExample>} [examples] - Reusable Example Objects.
 * @property {Record<string, OpenAPIRequestBody>} [requestBodies] - Reusable Request Body Objects.
 * @property {Record<string, OpenAPIHeader>} [headers] - Reusable Header Objects.
 * @property {Record<string, OpenAPISecurityScheme>} [securitySchemes] - Reusable Security Scheme Objects.
 * @property {Record<string, OpenAPILink>} [links] - Reusable Link Objects.
 * @property {Record<string, OpenAPICallback>} [callbacks] - Reusable Callback Objects.
 * @property {Record<string, OpenAPIPathItem>} [pathItems] - Reusable Path Item Objects.
 */
type OpenAPIComponents = {
  schemas?: Record<string, OpenAPISchema>;
  responses?: Record<string, OpenAPIResponse | OpenAPIReference>;
  parameters?: Record<string, OpenAPIParameter>;
  examples?: Record<string, OpenAPIExample>;
  requestBodies?: Record<string, OpenAPIRequestBody>;
  headers?: Record<string, OpenAPIHeader>;
  securitySchemes?: Record<string, OpenAPISecurityScheme>;
  links?: Record<string, OpenAPILink>;
  callbacks?: Record<string, OpenAPICallback>;
  pathItems?: Record<string, OpenAPIPathItem>;
};

/**
 * Represents a schema object in OpenAPI specification.
 * @interface
 * @property {OpenAPIDiscriminator} [discriminator] - Adds support for polymorphism. The discriminator is an object name that is used to differentiate between other schemas.
 * @property {OpenAPIXML} [xml] - Additional metadata to describe the XML representation of this property. Only applicable on properties schemas, not root schemas.
 * @property {OpenAPIExternalDocs} [externalDocs] - Additional external documentation for this schema.
 */
type OpenAPISchema = {
  discriminator?: OpenAPIDiscriminator;
  xml?: OpenAPIXML;
  externalDocs?: OpenAPIExternalDocs;
  // @deprecated Deprecated: The example property has been deprecated in favor of the JSON Schema examples keyword. Use of example is discouraged, and later versions of this specification may remove it.
  // example?: any;
};

/**
 * Object representing OpenAPI discriminator.
 * @see https://spec.openapis.org/oas/v3.1.0#discriminator-object
 * @typedef {Object} OpenAPIDiscriminator
 * @property {string} propertyName - The name of the property in the payload that will hold the discriminator value.
 * @property {Record<string, string>} [mapping] - An object to hold mappings between payload values and schema names or references.
 */
type OpenAPIDiscriminator = {
  propertyName: string;
  mapping?: Record<string, string>;
};

/**
 * Describes XML structure information for elements and attributes.
 * @interface OpenAPIXML
 * @property {string} [name] - Replaces the name of the element/attribute used for the described schema property.
 * When defined within items, affects the name of individual XML elements in the list.
 * When defined alongside type being array (outside items), affects the wrapping element only if wrapped is true.
 * If wrapped is false, it will be ignored.
 * @property {string} [namespace] - The URI of the namespace definition. Must be in the form of an absolute URI.
 * @property {string} [prefix] - The prefix to be used for the name.
 * @property {boolean} [attribute] - Declares whether the property translates to an attribute instead of an element. Defaults to false.
 * @property {boolean} [wrapped] - Only applicable for array definitions. Indicates if the array is wrapped
 * (e.g., <books><book/><book/></books>) or unwrapped (<book/><book/>). Defaults to false.
 * Only takes effect when defined alongside type being array (outside items).
 */
type OpenAPIXML = {
  name?: string;
  namespace?: string;
  prefix?: string;
  attribute?: boolean;
  wrapped?: boolean;
};

/**
 * Allows referencing an external resource for extended documentation.
 * @see https://spec.openapis.org/oas/v3.1.0#external-documentation-object
 * @property {string} [description] - A description of the target documentation. CommonMark syntax may be used for rich text representation.
 * @property {string} url - The URL for the target documentation. Must be in the form of a valid URL.
 */
type OpenAPIExternalDocs = {
  description?: string;
  url: string;
};

/**
 * Represents an OpenAPI Response Object.
 * @see https://spec.openapis.org/oas/latest.html#response-object
 *
 * @property {string} description - A description of the response. CommonMark syntax MAY be used for rich text representation.
 *
 * @property {Record<string, OpenAPIHeader | OpenAPIReference>} [headers] - Maps a header name to its definition.
 * RFC7230 states header names are case insensitive. If a response header is defined with the name "Content-Type",
 * it SHALL be ignored.
 *
 * @property {Record<string, OpenAPIMediaType>} [content] - A map containing descriptions of potential response payloads.
 * The key is a media type or media type range (see RFC7231 Appendix D), and the value describes it.
 * For responses that match multiple keys, only the most specific key is applicable (e.g., text/plain overrides text/*).
 *
 * @property {Record<string, OpenAPILink | OpenAPIReference>} [links] - A map of operations links that can be followed
 * from the response. The key of the map is a short name for the link, following the naming constraints of the names
 * for Component Objects.
 */
type OpenAPIResponse = {
  description: string;
  headers?: Record<string, OpenAPIHeader | OpenAPIReference>;
  content?: Record<string, OpenAPIMediaType>;
  links?: Record<string, OpenAPILink | OpenAPIReference>;
};

/**
 * Represents a header in the OpenAPI specification.
 *
 * @property {string} name - REQUIRED. The name of the header.
 * @property {string} [description] - A description for the header. CommonMark syntax MAY be used for rich text representation.
 * @property {OpenAPIExternalDocs} [externalDocs] - Additional external documentation for this header.
 *
 * @see {@link OpenAPIExternalDocs} for external documentation structure
 */
type OpenAPIHeader = {
  name: string;
  description?: string;
  externalDocs?: OpenAPIExternalDocs;
};

/**
 * Describes a Media Type Object in OpenAPI specification.
 * @see https://spec.openapis.org/oas/v3.1.0#media-type-object
 *
 * @property {OpenAPISchema} [schema] - The schema defining the content of the request, response, or parameter.
 *
 * @property {any} [example] - Example of the media type. The example object SHOULD be in the correct format
 * as specified by the media type. Mutually exclusive with 'examples' field. If referencing a schema which
 * contains an example, this value SHALL override the schema's example.
 *
 * @property {Record<string, OpenAPIExample | OpenAPIReference>} [examples] - Examples of the media type.
 * Each example object SHOULD match the media type and specified schema if present. Mutually exclusive with
 * 'example' field. If referencing a schema which contains an example, these values SHALL override the
 * schema's example.
 *
 * @property {Record<string, OpenAPIEncoding>} [encoding] - A map between a property name and its encoding
 * information. The key, being the property name, MUST exist in the schema as a property. The encoding object
 * SHALL only apply to requestBody objects when the media type is multipart or application/x-www-form-urlencoded.
 */
type OpenAPIMediaType = {
  schema?: OpenAPISchema | OpenAPIDefaultSchema;
  // deno-lint-ignore no-explicit-any
  example?: any;
  examples?: Record<string, OpenAPIExample | OpenAPIReference>;
  encoding?: Record<string, OpenAPIEncoding>;
};

/**
 * Represents an example that can be used to demonstrate the structure and content of a schema.
 * @see https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#example-object
 * @interface OpenAPIExample
 * @property {string} [summary] - Short description for the example
 * @property {string} [description] - Long description for the example. CommonMark syntax may be used for rich text representation
 * @property {any} [value] - Embedded literal example. Mutually exclusive with externalValue. For media types that cannot be naturally represented in JSON/YAML, use string with escaping
 * @property {string} [externalValue] - A URI pointing to the literal example. Mutually exclusive with value. Used for examples that cannot be easily included in JSON/YAML documents
 */
type OpenAPIExample = {
  summary?: string;
  description?: string;
  // deno-lint-ignore no-explicit-any
  value?: any;
  externalValue?: string;
};

/**
 * A single encoding definition applied to a single schema property.
 * @see {@link https://spec.openapis.org/oas/v3.1.0#encoding-object OpenAPI Encoding Object}
 *
 * @property {string} [contentType] - The Content-Type for encoding a specific property.
 * Defaults based on property type:
 * - object: application/json
 * - array: based on inner type
 * - others: application/octet-stream
 * Can be a specific media type, wildcard type, or comma-separated list.
 *
 * @property {Record<string, OpenAPIHeader | OpenAPIReference>} [headers] - Additional headers
 * like Content-Disposition. Content-Type is handled separately and ignored here.
 * Only applicable for multipart request bodies.
 *
 * @property {string} [style] - Defines property value serialization based on type.
 * Follows query parameter style rules. Ignored if request body is not
 * application/x-www-form-urlencoded or multipart/form-data.
 *
 * @property {boolean} [explode] - When true, array/object properties generate separate
 * parameters per value/key-value pair. Defaults to true for style="form", false otherwise.
 * Only applicable for application/x-www-form-urlencoded or multipart/form-data.
 *
 * @property {boolean} [allowReserved] - When true, allows RFC3986 reserved characters
 * without percent-encoding. Defaults to false. Only applicable for
 * application/x-www-form-urlencoded or multipart/form-data.
 */
type OpenAPIEncoding = {
  contentType?: string;
  headers?: Record<string, OpenAPIHeader | OpenAPIReference>;
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
};

/**
 * Represents a link between OpenAPI operations.
 * @see {@link https://spec.openapis.org/oas/v3.1.0#link-object}
 *
 * @property {string} [operationRef] - A relative or absolute URI reference to an OAS operation.
 *   This field is mutually exclusive with operationId and must point to an Operation Object.
 *   Relative operationRef values may be used to locate existing Operation Objects in the OpenAPI definition.
 *
 * @property {string} [operationId] - The name of an existing, resolvable OAS operation,
 *   defined with a unique operationId. This field is mutually exclusive with operationRef.
 *
 * @property {Record<string, RuntimeExpressionOrValue<any>>} [parameters] - A map of parameters to pass to the operation.
 *   Keys are parameter names (can be qualified using {in}.{name}), values can be constants or expressions.
 *   Example: 'path.id' for parameters with same name in different locations.
 *
 * @property {RuntimeExpressionOrValue<any>} [requestBody] - A literal value or expression
 *   to use as request body when calling the target operation.
 *
 * @property {string} [description] - A description of the link.
 *   Supports CommonMark syntax for rich text representation.
 *
 * @property {OpenAPIServer} [server] - A server object to be used by the target operation.
 */
type OpenAPILink = {
  operationRef?: string;
  operationId?: string;
  // deno-lint-ignore no-explicit-any
  parameters?: Record<string, RuntimeExpressionOrValue<any>>;
  // deno-lint-ignore no-explicit-any
  requestBody?: RuntimeExpressionOrValue<any>;
  description?: string;
  server?: OpenAPIServer;
};

/**
 * Represents an OpenAPI runtime expression following the syntax:
 * ($url / $method / $statusCode / $request.<source> / $response.<source>)
 * Where source can reference headers, query params, path params, or body values.
 * @example "$request.header.content-type"
 * @example "$response.body#/data/id"
 */
type RuntimeExpression = string;

/**
 * A value that can be either a static value or a runtime expression
 */
type RuntimeExpressionOrValue<T> = T | { expression: RuntimeExpression };

/**
 * Represents an OpenAPI Reference Object which can be used to reference reusable objects through a URI.
 * @see https://spec.openapis.org/oas/v3.1.0#reference-object
 *
 * @property {string} $ref - The reference identifier. This MUST be in the form of a URI.
 * @property {string} [summary] - A short summary which by default SHOULD override that of the referenced component.
 *                               If the referenced object-type does not allow a summary field, then this field has no effect.
 * @property {string} [description] - A description which by default SHOULD override that of the referenced component.
 *                                   CommonMark syntax MAY be used for rich text representation.
 *                                   If the referenced object-type does not allow a description field, then this field has no effect.
 */
type OpenAPIReference = {
  $ref: string;
  summary?: string;
  description?: string;
};

/**
 * Represents a parameter in an OpenAPI specification.
 * @property {string} name - REQUIRED. The name of the parameter (case sensitive).
 *    For path parameters, must match a template expression in the path field.
 *    Ignored for header parameters named "Accept", "Content-Type" or "Authorization".
 *
 * @property {OpenAPIParameterLocation} in - REQUIRED. The parameter location.
 *    Must be one of: "query", "header", "path" or "cookie".
 *
 * @property {string} [description] - Brief description of the parameter.
 *    Supports CommonMark syntax for rich text.
 *
 * @property {boolean} required - Whether parameter is mandatory.
 *    Must be true for path parameters. Defaults to false otherwise.
 *
 * @property {boolean} [deprecated] - Indicates parameter should be phased out.
 *    Defaults to false.
 *
 * @property {boolean} [allowEmptyValue] - Enables empty-valued parameters.
 *    Only valid for query parameters. Not recommended, may be removed.
 *    Defaults to false.
 *
 * @property {string} [style] - Defines parameter value serialization.
 *    Defaults based on 'in' value:
 *    - query: "form"
 *    - path: "simple"
 *    - header: "simple"
 *    - cookie: "form"
 *
 * @property {boolean} [explode] - If true, array/object values generate separate parameters.
 *    Defaults to true for style="form", false otherwise.
 *
 * @property {boolean} [allowReserved] - Allows RFC3986 reserved characters without encoding.
 *    Only applies to query parameters. Defaults to false.
 *
 * @property {OpenAPISchema | OpenAPIReference} [schema] - Defines parameter type schema.
 *    Mutually exclusive with content property.
 *
 * @property {any} [example] - Example parameter value matching schema.
 *    Mutually exclusive with examples property.
 *
 * @property {Record<string, OpenAPIExample | OpenAPIReference>} [examples] - Multiple examples.
 *    Mutually exclusive with example property.
 *
 * @property {Record<string, OpenAPIMediaType>} [content] - Complex parameter media type definition.
 *    Must contain exactly one entry. Mutually exclusive with schema property.
 */
type OpenAPIParameter = {
  name: string;
  in: OpenAPIParameterLocation;
  description?: string;
  required: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
  schema?: OpenAPISchema | OpenAPIReference | OpenAPIDefaultSchema;
  // deno-lint-ignore no-explicit-any
  example?: any;
  examples?: Record<string, OpenAPIExample | OpenAPIReference>;
  content?: Record<string, OpenAPIMediaType>;
};

/**
 * Represents an OpenAPI Request Body Object.
 */
type OpenAPIParameterLocation = "query" | "header" | "path" | "cookie";

type OpenAPIDefaultSchema = {
  type: string;
  enum?: string[];
  default?: string;
  example?: string;
  properties?: Record<string, OpenAPISchema | OpenAPIDefaultSchema>;
};

/**
 * The request body applicable for this operation.
 * @see https://spec.openapis.org/oas/v3.1.0#request-body-object
 *
 * @property {string} [description] - A brief description of the request body.
 *   CommonMark syntax may be used for rich text representation.
 *
 * @property {Record<string, OpenAPIMediaType>} content - The content of the request body.
 *   Keys are media types or media type ranges (see RFC7231).
 *   For multiple matching keys, the most specific key applies (e.g., text/plain overrides text/*).
 *
 * @property {boolean} required - Determines if the request body is required in the request.
 *   Defaults to false.
 */
type OpenAPIRequestBody = {
  description?: string;
  content: Record<string, OpenAPIMediaType>;
  required: boolean;
};

/**
 * Represents a security scheme in OpenAPI specification.
 * @typedef {Object} OpenAPISecurityScheme
 * @property {('apiKey'|'http'|'mutualTLS'|'oauth2'|'openIdConnect')} type - The type of the security scheme.
 * @property {string} [description] - A description for security scheme. CommonMark syntax may be used for rich text representation.
 * @property {string} [name] - Required for apiKey. The name of the header, query or cookie parameter to be used.
 * @property {('query'|'header'|'cookie')} [in] - Required for apiKey. The location of the API key.
 * @property {string} [scheme] - Required for http. The name of the HTTP Authorization scheme to be used in the Authorization header as defined in RFC7235.
 * @property {string} [bearerFormat] - A hint to the client to identify how the bearer token is formatted. Used with http("bearer").
 * @property {OpenAPIOAuthFlows} [flows] - Required for oauth2. Configuration information for the supported flow types.
 * @property {string} [openIdConnectUrl] - Required for openIdConnect. OpenId Connect URL to discover OAuth2 configuration values. Must be a valid HTTPS URL.
 */
type OpenAPISecurityScheme = {
  type: string;
  description?: string;
  name?: string;
  in?: string;
  scheme?: string;
  bearerFormat?: string;
  flows?: OpenAPIOAuthFlows;
  openIdConnectUrl?: string;
};

/**
 * OAuth Flows Object
 * Contains configuration details for different OAuth flows supported in OpenAPI.
 *
 * @property {OpenAPIOAuthFlow} [implicit] - Configuration for the OAuth Implicit flow
 * @property {OpenAPIOAuthFlow} [password] - Configuration for the OAuth Resource Owner Password flow
 * @property {OpenAPIOAuthFlow} [clientCredentials] - Configuration for the OAuth Client Credentials flow (formerly 'application' in OpenAPI 2.0)
 * @property {OpenAPIOAuthFlow} [authorizationCode] - Configuration for the OAuth Authorization Code flow (formerly 'accessCode' in OpenAPI 2.0)
 */
type OpenAPIOAuthFlows = {
  implicit?: OpenAPIOAuthFlow;
  password?: OpenAPIOAuthFlow;
  clientCredentials?: OpenAPIOAuthFlow;
  authorizationCode?: OpenAPIOAuthFlow;
};

/**
 * Describes an OAuth Flow object as defined in OpenAPI 3.0
 * @see https://spec.openapis.org/oas/v3.0.3#oauth-flows-object
 *
 * @property {string} authorizationUrl - The authorization URL for this flow. Must be a valid URL using TLS.
 *                                      Required for implicit and authorizationCode flows.
 *
 * @property {string} tokenUrl - The token URL for this flow. Must be a valid URL using TLS.
 *                              Required for password, clientCredentials and authorizationCode flows.
 *
 * @property {string} [refreshUrl] - Optional URL for obtaining refresh tokens. Must be a valid URL using TLS.
 *
 * @property {Record<string, string>} scopes - Available scopes for the OAuth2 security scheme.
 *                                            Maps scope names to their descriptions.
 *                                            Can be empty but must be present.
 */
type OpenAPIOAuthFlow = {
  authorizationUrl: string;
  tokenUrl: string;
  refreshUrl?: string;
  scopes: Record<string, string>;
};

/**
 * A map containing possible out-of-band callbacks related to the parent operation.
 * Each value in the map is a Path Item Object that describes a set of requests that may be initiated by the API provider and the expected responses.
 * The key value used to identify the callback object is an expression, evaluated at runtime, that identifies a URL to use for the callback operation.
 *
 * @see https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#callbackObject
 *
 * @example
 * {
 *   "myCallback": {
 *     "/some/path": {
 *       "post": {
 *         "requestBody": { ... },
 *         "responses": { ... }
 *       }
 *     }
 *   }
 * }
 */
type OpenAPICallback = {
  [key: string]: OpenAPIPathItem | OpenAPIReference;
};

/**
 * Represents a Path Item Object in OpenAPI specification that describes the operations available on a single path.
 * @see https://spec.openapis.org/oas/v3.1.0#path-item-object
 * @interface
 *
 * @property {string} [$ref] - Reference to a Path Item Object defined elsewhere
 * @property {string} [summary] - Short summary of what the path does
 * @property {string} [description] - Detailed description of the path, may contain CommonMark syntax
 * @property {OpenAPIOperation} [get] - GET operation for this path
 * @property {OpenAPIOperation} [put] - PUT operation for this path
 * @property {OpenAPIOperation} [post] - POST operation for this path
 * @property {OpenAPIOperation} [delete] - DELETE operation for this path
 * @property {OpenAPIOperation} [options] - OPTIONS operation for this path
 * @property {OpenAPIOperation} [head] - HEAD operation for this path
 * @property {OpenAPIOperation} [patch] - PATCH operation for this path
 * @property {OpenAPIOperation} [trace] - TRACE operation for this path
 * @property {OpenAPIServer[]} [servers] - Alternative servers to service operations in this path
 * @property {(OpenAPIParameter | OpenAPIReference)[]} [parameters] - Parameters common to all operations under this path
 */
type OpenAPIPathItem = {
  $ref?: string;
  summary?: string;
  description?: string;
  get?: OpenAPIOperation;
  put?: OpenAPIOperation;
  post?: OpenAPIOperation;
  delete?: OpenAPIOperation;
  options?: OpenAPIOperation;
  head?: OpenAPIOperation;
  patch?: OpenAPIOperation;
  trace?: OpenAPIOperation;
  servers?: OpenAPIServer[];
  parameters?: (OpenAPIParameter | OpenAPIReference)[];
};

/**
 * Represents an OpenAPI Operation Object that describes a single API operation on a path.
 *
 * @property {string[]} [tags] - Tags for API documentation control. Used for logical grouping of operations.
 * @property {string} [summary] - Short summary of the operation's functionality.
 * @property {string} [description] - Detailed explanation of operation behavior. Supports CommonMark syntax.
 * @property {OpenAPIExternalDocs} [externalDocs] - Additional external documentation.
 * @property {string} [operationId] - Unique identifier for the operation. Must be unique across all API operations.
 * @property {(OpenAPIParameter | OpenAPIReference)[]} [parameters] - List of applicable parameters. Can override but not remove Path Item parameters.
 * @property {OpenAPIRequestBody | OpenAPIReference} [requestBody] - Request body details. Should be avoided for GET, HEAD and DELETE methods.
 * @property {Record<string, OpenAPIResponse | OpenAPIReference>} responses - Possible responses from operation execution.
 * @property {Record<string, OpenAPICallback | OpenAPIReference>} [callbacks] - Map of possible out-of-band callbacks.
 * @property {boolean} [deprecated] - Indicates if operation is deprecated. Defaults to false.
 * @property {Record<string, string[]>} [security] - Security mechanisms for this operation. Overrides top-level security.
 * @property {OpenAPIServer[]} [servers] - Alternative servers for this operation. Overrides Path Item and Root level servers.
 */
type OpenAPIOperation = {
  tags?: string[];
  summary?: string;
  description?: string;
  externalDocs?: OpenAPIExternalDocs;
  operationId?: string;
  parameters?: (OpenAPIParameter | OpenAPIReference)[];
  requestBody?: OpenAPIRequestBody | OpenAPIReference;
  responses: Record<string, OpenAPIResponse | OpenAPIReference>;
  callbacks?: Record<string, OpenAPICallback | OpenAPIReference>;
  deprecated?: boolean;
  security?: Record<string, string[]>;
  servers?: OpenAPIServer[];
};

/**
 * Represents an OpenAPI Tag Object that adds metadata to a single tag from the tags array.
 * @see https://spec.openapis.org/oas/v3.1.0#tag-object
 *
 * @property {string} name - REQUIRED. The name of the tag.
 * @property {string} [description] - A description for the tag. CommonMark syntax MAY be used for rich text representation.
 * @property {OpenAPIExternalDocs} [externalDocs] - Additional external documentation for this tag.
 */
type OpenAPITag = {
  name: string;
  description?: string;
  externalDocs?: OpenAPIExternalDocs;
};

type OpenAPIYelixDoc = {
  path: string;
  method: string;
} & OpenAPIDoc;

type OpenAPIDoc = {
  hide?: boolean; // default: false
  title?: string;
  description?: string;
  tags?: string[];
  responses?: Record<string, unknown>;
  validation?: ValidationType;
  query?: Record<string, { description: string }>;
};

type InitializeOpenAPIParams = {
  title: string;
  version: string;
  description?: string;
  servers?: OpenAPIServer[];
};

type OpenAPIParams = {
  version: string;
  title: string;
  description?: string;
  servers?: OpenAPIServer[];
};

type AddOpenAPIEndpointResponseParams = {
  description?: string;
  type: string; // MIME type
  zodSchema: YelixValidationBase | null;
};

type NewEndpointParams = {
  path: string;
  method: string;
  title?: string;
  description?: string;
  tags?: string[];
  responses?: Record<string, AddOpenAPIEndpointResponseParams>;
  validation?: ValidationType;
  query?: Record<string, { description: string }>;
};

export type {
  AddOpenAPIEndpointResponseParams,
  InitializeOpenAPIParams,
  NewEndpointParams,
  OpenAPI,
  OpenAPICallback,
  OpenAPIComponents,
  OpenAPIContact,
  OpenAPIDefaultSchema,
  OpenAPIDiscriminator,
  OpenAPIDoc,
  OpenAPIEncoding,
  OpenAPIExample,
  OpenAPIExternalDocs,
  OpenAPIHeader,
  OpenAPIInfo,
  OpenAPILicense,
  OpenAPILink,
  OpenAPIMediaType,
  OpenAPIMethods,
  OpenAPIOAuthFlow,
  OpenAPIOAuthFlows,
  OpenAPIOperation,
  OpenAPIParameter,
  OpenAPIParameterLocation,
  OpenAPIParams,
  OpenAPIPathItem,
  OpenAPIReference,
  OpenAPIRequestBody,
  OpenAPIResponse,
  OpenAPISchema,
  OpenAPISecurityScheme,
  OpenAPIServer,
  OpenAPIServerVariable,
  OpenAPITag,
  OpenAPIXML,
  OpenAPIYelixDoc,
  RuntimeExpression,
  RuntimeExpressionOrValue,
  SecurityRequirement,
};
