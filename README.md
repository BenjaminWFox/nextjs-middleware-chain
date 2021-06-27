# Next.js Middleware Chain

Next.js Middleware Chain (NMC) is a lightweight, zero-dependency middleware solution for Next.js built on the idea that middleware functions are more flexible when they can be chained as needed during development.

NMC aims to provide a simple framework for writing methods that can be run before *either* API or SSR (`getServerSideProps`) routes.

This library is still in an early stage of development. It has been tested it in a couple projects and should be stable, however there may be bugs or scenarios that have not been realized or planned for.

If you encounter a bug or problem, please [open an issue](https://github.com/BenjaminWFox/nextjs-middleware-chain/issues).

If you have feedback or questions, please [start a discussion](https://github.com/BenjaminWFox/nextjs-middleware-chain/discussions).

Please be civil and abide by the [code of conduct](https://github.com/BenjaminWFox/nextjs-middleware-chain/blob/main/CODE-OF-CONDUCT.md).

## Why

Next.js does a lot of great things. Middleware is not one of them. If you want to implement some functionality for all API routes (logging at start & finish, for instance) you have to either explicitly add it to all your routes or write your own reusable solution.

This gets doubly complex if you want to re-use the same functionality across API Routes and SSR data fetching methods, since the function APIs and behaviors differ in small but important ways.

It would be a lot easier to just write the middleware functions you want and then compose them however you need when building out new pages and routes.

That's the goal.

## Installation

`npm install nextjs-middleware-chain`

## Setup & Usage

This package exports a single named function `createMiddleware` which takes two arguments, an array of middleware functions and an object of options to set globally for all middlware instances.

`createMiddleware` returns a factory function which, when called, returns an instance of a `Middleware` class which is used to run any subsequently chained functions.

This README will go into more detail for each part, but some initial context the setup & usage of NCM looks like:

```javascript
// Setup in a `middleware.js` file...
import { createMiddleware } from 'nextjs-middleware-chain'

const mwFunction = (req, res, next) => {
  console.log('Running function!')

  return next()
}

const middlewareFunctionsArray = [ mwFunction ]

const optionsObject = { useChainOrder: true }

const mwFactory = createMiddleware(
  middlewareFunctionsArray,
  optionsObject
)

export default mwFactory

// Usage in an API or SSR route...
import mwFactory from './middleware'

/* ... api or ssr routeFunction(...) {...} ... */

export default mwFactory().mwFunction().finish(
  routeFunction,        // required
  'Friendly Route Name' // optional
)
```

This repo also includes a Next.js sample "client" project which you can reference & run to test out the library. You can reference the setup & syntax for NMC in these files:
- [middleware setup](https://github.com/BenjaminWFox/nextjs-middleware-chain/blob/main/client/src/middleware/index.js)
- [api route implementation](https://github.com/BenjaminWFox/nextjs-middleware-chain/blob/main/client/src/pages/api/apiRoute/apiFetch.js)
- [ssr route implementation](https://github.com/BenjaminWFox/nextjs-middleware-chain/blob/main/client/src/pages/ssr-route.js)

### Middleware Functions Array

Any middleware functions you create will be made available to NMC by adding them to this array, and passing this array as the first argument to `createMiddleware`.

### Options object

The default options will apply globally unless they are overwritten. You can overwrite options:
- **globally**: by passing an object as the second argument to the `createMiddleware` function.
- **per-route**: by passing an object as the only argument to the middleware factory responsible for creating an instance of the middleware.
  -  `mwFactory(optionsObject).mwFunction().finish(...)`

Property | Type | Default | Purpose
--- | --- | --- | ---
useChainOrder | bool | true | Run middleware functions in the order they are used in the chain. When `false` this will ***always*** run the middleware function in the same order - the order they were added to the functions array passed to `createMiddleware`.
useAsyncMiddleware | bool | true | Run middleware functions asynchronously. When `false` middleware functions will run synchronously.
reqPropName | string | `nmc` | The name of the decoration property added to the `req` object for all routes. You can rename this if it causes a collision or of you don't like these letters.
onMiddlewareStart | function | (req) => {} | Run before starting the middleware chain. Receives the decorated `req` object as an argument.
onMiddlewareComplete | function | (req) => {} | Run after all middleware is complete (or when `next()` is called with `'end'` or `'route'`) and before the Next.js route is run. Receives the decorated `req` object as an argument.
onRouteComplete | function | (req) => {} | Runs after the Next.js route has been run (or skipped). Receives the decorated `req` object as an argument.

### Writing middleware functions

All middleware functions will receive 3 arguments:
- `req`
- `res`
- `next`

`req` and `res` are provided by the Next.js route. They will be passed by reference to all middleware functions, so can be mutated throughout the chain. Be aware than if you are using a chain function in *both* API and SSR contexts you may not have access to certain Next.js-provided decorations, which are only added for API routes:
  - [Request Helpers](https://nextjs.org/docs/api-routes/api-middlewares)
  - [Response Helpers](https://nextjs.org/docs/api-routes/response-helpers)

`next` is a custom function for NMC. Each middleware function must `return next()` in order to continue running the middleware.

A basic middleware function looks like:

```
const middlewareChainFn = (req, res, next) => {
  // Do things here...
  
  return next()
}
```

### Short-circuiting the middleware runner

You can break the chain in one of three ways.

To skip any remaining middleware functions ***and execute the Next.js route***:

- `return next('route')`

To skip any remaining middleware function ***and ignore the Next.js route***:

- From API routes: End the response via the `res` object, and return nothing.
  - `res.status(###).json({ message: '...' })`
- From SSR routes: Return with the keyword `'end'` and a payload object.
  -  `return next('end', { ...payload })`
    - **The payload object is required** - it will be the `return` from `getServerSideProps` so should be [a standard Next.js getServerSideProps response](https://nextjs.org/docs/basic-features/data-fetching#getserversideprops-server-side-rendering).

```javascript
const isAuthorized = (req, res, next) => {
  // Some authorization function...
  const authorized = getAuthorization(req)

  if (req.nmc.type === 'api' && !authorized) {
    // End the request if it is an API route
    res.status(401).json({error: 'unauthorized', message: '...'})
  } else if (req.nmc.type === 'ssr' && !authorized) {
    // End the request if it is an SSR route
    return next('end', {
      redirect: {
        destination: '/',
        permanent: false,
      }
    })
  } else {
    // Skip remaining middleware and continue with the Next.js route.
    return next('route')
  }
}
```

### Request Decoration

NMC will add a custom property, `nmc`, (the prop name is configurable in options) to the `req` received by each middleware function. This object will contain:

Property | Type | Value
--- | --- | ---
`id` | `string` | a random guid unique to each middleware instance
`name` | `string` | `finalFuncName` if provided, otherwise `finalFunc.name`, otherwise `''`
`type` | `string` | `api` or `ssr` - the type of route the middleware is being run from<sup>*</sup>
`context` | `object` | The Next.js `context` object [provided to SSR routes](https://nextjs.org/docs/basic-features/data-fetching#getserversideprops-server-side-rendering). Will be `{}` for API routes.

<sup>*</sup> This determination is made based on the arguments the middleware runner receives from Next.js, which will either be `(req, res) => {...}` for API routes, or `(context, undefined) => {...}` for SSR routes.

## Middleware Patterns

### One Middleware to run Multiple Middlewares

You can run middleware functions yourself, if desired, but you will have to handle the returns from each as needed for your use-case:

```javascript
const common = async (req, res, next) => {
  const aReturn = fnA(req, res, next)
  const bReturn = await fnB(req, res, next)
  const authReturn = unauthorized(req, res, next)

  if (authReturn) {
    return authReturn
  }
}
```

### Prebuilt Middleware Chain

You can create pre-built chains of middleware if certain functions are commonly used together, or should always be run in a specific order:

```javascript
// Creating a pre-built chain in middleware.js
const mwFactory = createMiddleware(
  middlewareFunctionsArray,
  optionsObject
)

const preBuiltChain = mwFactory().fnA().fnB().fnC()

export { preBuiltChain }
export default mwFactory

// Using a pre-built chain
import { preBuiltChain } from 'nextjs-middleware-chain'

/* ... api or ssr routeFunction(...) {...} ... */

export default preBuiltChain.otherMiddleware().finish(routeFunction)
```

Note that when you import & use the `preBuiltChain` it is *already* an instance of `Middleware` and so should be accessed as an object, not run as a method.

## Planned Work

- Add automatic versioning & releases
- Add additional unit tests
- Move to TypeScript
