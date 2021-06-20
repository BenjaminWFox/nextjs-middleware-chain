import { Middleware, DEFAULT_OPTIONS } from './middleware'

/**
 * This is a factory function factory function.
 *
 * @param {*} fnsArray
 * @param {*} globalOptions
 *
 * @returns A factory function used to create new instances of the Middleware class
 */
const middlewareFactoryFactory = function middlewareFactoryFactory(fnsArray, globalOptions) {
  console.info('Available Functions:', fnsArray)

  // Inline options will overwrite global options
  return (inlineOptions) => new Middleware(fnsArray, globalOptions, inlineOptions)
}

/**
 * This is run once on creation. It return a
 * @param {object} fnsArray       A collection of functions
 * @param {MiddlewareOptions} globalOptions  An object options
 * @returns
 */
export const createMiddleware = (fnsArray, globalOptions = {}) => {
  if (!fnsArray?.length) {
    throw new Error('A functions array must be provided as the first argument.')
  }

  Object.values(fnsArray).forEach((fn) => {
    if (typeof fn !== 'function') {
      throw new Error('Items in the functions array must be a function.')
    }
    if (!fn.name) {
      throw new Error('Items in the functions array must be named functions.')
    }
  })

  Object.keys(globalOptions).forEach((key) => {
    if (!DEFAULT_OPTIONS[key]) {
      console.warn(`Unknown option ${key} provided. Ignoring.`)
    }
  })

  return middlewareFactoryFactory(fnsArray, globalOptions)
}
