export type ApiReferenceOptions = ReferenceConfiguration & {
  pageTitle?: string;
  cdn?: string;
};

export type ThemeId =
  | "alternate"
  | "default"
  | "moon"
  | "purple"
  | "solarized"
  | "bluePlanet"
  | "deepSpace"
  | "saturn"
  | "kepler"
  | "elysiajs"
  | "fastify"
  | "mars"
  | "none";

export type SpecConfiguration = {
  /**
   * URL to an OpenAPI/Swagger document
   */
  url?: string;
  /**
   * Directly embed the OpenAPI document in the HTML.
   *
   * @remark It’s recommended to pass an `url` instead of `content`.
   */
  // deno-lint-ignore no-explicit-any
  content?: string | Record<string, any> | (() => Record<string, any>) | null;
};

export type ReferenceConfiguration = {
  /** A string to use one of the color presets */
  theme?: ThemeId;
  /** The layout to use for the references */
  layout?: "modern" | "classic";
  /** The Swagger/OpenAPI spec to render */
  spec?: SpecConfiguration;
  /**
   * URL to a request proxy for the API client
   *
   * @deprecated Use proxyUrl instead
   */
  proxy?: string;
  /** URL to a request proxy for the API client */
  proxyUrl?: string;
  /** Whether the spec input should show */
  isEditable?: boolean;
  /** Whether to show the sidebar */
  showSidebar?: boolean;
  /**
   * Whether to show models in the sidebar, search, and content.
   *
   * @default false
   */
  hideModels?: boolean;
  /**
   * Whether to show the “Download OpenAPI Document” button
   *
   * @default false
   */
  hideDownloadButton?: boolean;
  /**
   * Whether to show the “Test Request” button
   *
   * @default: false
   */
  hideTestRequestButton?: boolean;
  /**
   * Whether to show the sidebar search bar
   *
   * @default: false
   */
  hideSearch?: boolean;
  /** Whether dark mode is on or off initially (light mode) */
  darkMode?: boolean;
  /** forceDarkModeState makes it always this state no matter what*/
  forceDarkModeState?: "dark" | "light";
  /** Whether to show the dark mode toggle */
  hideDarkModeToggle?: boolean;
  /** Key used with CTRL/CMD to open the search modal (defaults to 'k' e.g. CMD+k) */
  searchHotKey?:
    | "a"
    | "b"
    | "c"
    | "d"
    | "e"
    | "f"
    | "g"
    | "h"
    | "i"
    | "j"
    | "k"
    | "l"
    | "m"
    | "n"
    | "o"
    | "p"
    | "q"
    | "r"
    | "s"
    | "t"
    | "u"
    | "v"
    | "w"
    | "x"
    | "y"
    | "z";
  /**
   * If used, passed data will be added to the HTML header
   * @see https://unhead.unjs.io/usage/composables/use-seo-meta
   */
  //metaData?: UseSeoMetaInput;
  /**
   * Path to a favicon image
   *
   * @default undefined
   * @example '/favicon.svg'
   */
  favicon?: string;
  /**
   * List of httpsnippet clients to hide from the clients menu
   * By default hides Unirest, pass `[]` to show all clients
   */
  //hiddenClients?: HiddenClients;
  /** Determine the HTTP client that’s selected by default */
  //defaultHttpClient?: HttpClientState;
  /** Custom CSS to be added to the page */
  customCss?: string;
  /** onSpecUpdate is fired on spec/swagger content change */
  onSpecUpdate?: (spec: string) => void;
  /** Prefill authentication */
  //authentication?: Partial<AuthenticationState>;
  /**
   * Route using paths instead of hashes, your server MUST support this
   * for example vue router needs a catch all so any subpaths are included
   *
   * @example
   * '/standalone-api-reference/:custom(.*)?'
   *
   * @experimental
   * @default undefined
   */
  //pathRouting?: PathRouting;
  /**
   * If you want to customize the heading portion of the hash you can pass in a function that receives the heading
   * and returns a string ID. This will then be used to generate the url hash. You control the whole hash with this
   * function.
   *
   * Note: you must pass this function through js, setting a data attribute will not work!
   *
   * @default
   * (heading: Heading) => `#description/${heading.slug}`
   */
  //generateHeadingSlug?: (heading: Heading) => string;
  /**
   * If you want to customize the model portion of the hash you can pass in a function that receives the model name
   * and returns a string ID. This will then be used to generate the url hash. model/ will get prepended to the result
   * of this function as seen far below.
   *
   * Note: you must pass this function through js, setting a data attribute will not work!
   *
   * @default
   * (model) => slug(model.name)
   *
   * which would give the full hash of `#model/${slug(model.name)}`
   */
  //generateModelSlug?: (model: {
  //    name: string;
  //}) => string;
  /**
   * If you want to customize the tag portion of the hash you can pass in a function that receives the tag
   * and returns a string ID. This will then be used to generate the url hash. tag/ will get prepended to the result
   * of this function as seen far below.
   *
   * Note: you must pass this function through js, setting a data attribute will not work!
   *
   * @default
   * (tag) => slug(tag.name)
   *
   * which would give the full hash of `#tag/tag-name`
   */
  //generateTagSlug?: (tag: Tag) => string;
  /**
   * If you want to customize the operation portion of the hash you can pass in a function that receives the operation
   * and returns a string ID. This will then be used to generate the url hash. tag/slug(tag.name) will get prepended to
   * the result of this function as seen far below.
   *
   * Note: you must pass this function through js, setting a data attribute will not work!
   *
   * @default
   * (operation) => `${operation.method}${operation.path}`
   *
   * which would give the full hash of `#tag/tag-name/post-path`
   */
  // generateOperationSlug?: (operation: {
  //     path: string;
  //     operationId: string | undefined;
  //     method: string;
  //     summary: string | undefined;
  // }) => string;
  /**
   * If you want to customize the webhook portion of the hash you can pass in a function that receives the webhook name
   * and possibly a HTTP verb and returns a string ID. This will then be used to generate the url hash. webhook/ will get
   * prepended to the result of this function as seen far below.
   *
   * Note: you must pass this function through js, setting a data attribute will not work!
   *
   * @default
   * (webhook) => slug(webhook.name)
   *
   * which would give the full hash of `#webhook/webhook-name`
   */
  // generateWebhookSlug?: (webhook: {
  //     name: string;
  //     method?: string;
  // }) => string;
  /**
   * The baseServerURL is used when the spec servers are relative paths and we are using SSR.
   * On the client we can grab the window.location.origin but on the server we need
   * to use this prop.
   *
   * @default undefined
   * @example 'http://localhost:3000'
   */
  baseServerURL?: string;
  /**
   * List of servers to override the servers in the given OpenAPI document
   *
   * @default undefined
   * @example [{ url: 'https://api.scalar.com', description: 'Production server' }]
   */
  //servers?: OpenAPIV3_1.ServerObject[];
  /**
   * We’re using Inter and JetBrains Mono as the default fonts. If you want to use your own fonts, set this to false.
   *
   * @default true
   */
  withDefaultFonts?: boolean;
  /**
   * By default we only open the relevant tag based on the url, however if you want all the tags open by default then set this configuration option :)
   *
   * @default false
   */
  defaultOpenAllTags?: boolean;
  /**
   * Sort tags alphabetically or with a custom sort function
   */
  //tagsSorter?: 'alpha' | ((a: Tag, b: Tag) => number);
  /**
   * Sort operations alphabetically, by method or with a custom sort function
   */
  //operationsSorter?: 'alpha' | 'method' | ((a: TransformedOperation, b: TransformedOperation) => number);
  /**
   * Specifies the integration being used. This is primarily for internal purposes and should not be manually set.
   *
   * It’s used to:
   * 1. Display debug information in the console.
   * 2. Show a custom logo when importing OpenAPI documents in the Scalar App.
   *
   * Each supported integration has a unique identifier (e.g., 'express', 'nextjs', 'vue').
   *
   * To explicitly disable this feature, you can pass `null`.
   *
   * @private
   */
  _integration?:
    | null
    | "adonisjs"
    | "docusaurus"
    | "dotnet"
    | "elysiajs"
    | "express"
    | "fastapi"
    | "fastify"
    | "go"
    | "hono"
    | "html"
    | "laravel"
    | "litestar"
    | "nestjs"
    | "nextjs"
    | "nitro"
    | "nuxt"
    | "platformatic"
    | "react"
    | "rust"
    | "vue";
  /**
   * Whether to show the client button from the reference sidebar and modal
   *
   * @default false
   */
  hideClientButton?: boolean;
};
