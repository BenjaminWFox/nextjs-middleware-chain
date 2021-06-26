# Next.js Middleware Chain

Next.js Middleware Chain (NMC) is a lightweight, zero-dependency middleware solution for Next.js built for use as chainable methods.

It aims to provide a simple framework for writing methods that can be run before *either* API routes or SSR (getServerSideProps) methods.

This library is still in an early stage of development. It has been tested it in a couple projects and should be stable, however there may be bugs or scenarios that have not been realized or planned for.

If you encounter a problem, please [open an issue](https://github.com/BenjaminWFox/nextjs-middleware-chain/issues) and remember to abide by the [code of conduct](https://github.com/BenjaminWFox/nextjs-middleware-chain/blob/main/CODE-OF-CONDUCT.md).

## Why

Next.js does a lot of great things. Middleware is not one of them. If you want to implement some functionality for all API routes (logging at start & finish, for instance) you have to either explicitly add it to all your routes or roll your own reusable solution.

This gets doubly complex if you want to re-use the same functionality across API Routes and SSR data fetching methods, since the function APIs and behaviors differ in small but important ways.

It would be a lot easier to just write the middleware functions you want and then compose them however you need when building out new pages and routes.

## Installation

`npm install nextjs-middleware-chain`

## Usage

work in progress...

This repo includes a Next.js "client" project which you can run to test out the middleware if desired. You can reference the setup & syntax for NMC in these files:
- [middleware setup](https://github.com/BenjaminWFox/nextjs-middleware-chain/blob/main/client/src/middleware/index.js)
- [api route implementation](https://github.com/BenjaminWFox/nextjs-middleware-chain/blob/main/client/src/pages/api/apiRoute/apiFetch.js)
- [ssr route implementation](https://github.com/BenjaminWFox/nextjs-middleware-chain/blob/main/client/src/pages/ssr-route.js)

### Writing middleware functions

All middleware functions will receive 3 arguments:
- `req`
- `res`
- `next`

```
const middlewareChainFn = (req, res, next) => {
  // Do things here...
  
  return next()
}
```

Caveats:
- The `req` and `res` objects are provided by the route, so be aware than if you are using a chain function in *both* API and SSR contexts you may not have access to certain Next.js-provided decorations, which are only added for API routes:
  - [Request Helpers](https://nextjs.org/docs/api-routes/api-middlewares)
  - [Response Helpers](https://nextjs.org/docs/api-routes/response-helpers)

### Middleware Functions Object

...wip

### Options object

Property | Type | Default | Purpose
--- | --- | --- | ---
useChainOrder | bool | true | Run middleware functions in the order they are used in the chain. When `false` this will ***always*** run the middleware function in the same order - the order they were added to the array passed to `createMiddleware`.
useAsyncMiddleware | bool | true | Run middleware functions asynchronously. When `false` middleware functions will run synchronously.
reqPropName | string | `nmc` | The name of the decoration property added to the `req` object for all routes. You can rename this if it causes a collision or of you don't like these letters.
onMiddlewareStart | function | () => {} | INCOMPLETE IMPLEMENTATION
onMiddlewareComplete | function | () => {} | INCOMPLETE IMPLEMENTATION
onRouteComplete | function | () => {} | INCOMPLETE IMPLEMENTATION

### .nmc
NMC will decorate the `req` object with the following properties:

Property | Type | Value
--- | --- | ---
`id` | `string` | a random guid unique to each middleware instance
`name` | `string` | the name provided to the `finish` function
`type` | `string` | `api` or `ssr` - the type of route the middleware is being run from

## TODO

- Finish event callback implementations
- Finish README
- Update unit tests
- Move to TypeScript