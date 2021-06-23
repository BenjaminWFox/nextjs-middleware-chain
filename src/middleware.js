import { uuidv4 } from './uuid'

/**
* @typedef MiddlewareOptions
* @type {object}
* @property {bool} useChainOrder       Should chained functions be run in chain order (vs initial creation order). Default: TRUE
* @property {bool} useAsyncMiddleware  Should middleware functions be able to run asynchronously? Default: FALSE
*/
export const DEFAULT_OPTIONS = {
  useChainOrder: true,
  useAsyncMiddleware: true,
  reqPropName: 'nmc',
  onMiddlewareStart: (id) => {
    console.debug('onMiddlewareStart', id)
  },
  onMiddlewareComplete: (id) => {
    console.debug('onMiddlewareComplete', id)
  },
  onRouteComplete: (id) => {
    console.debug('onRouteComplete', id)
  },
}

export class Middleware {
  constructor(fnsArray, globalOptions, inlineOptions) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...globalOptions,
      ...inlineOptions,
    }
    this.run = []
    this.id = uuidv4()
    this.finish = function finish(finalFunc, finalFuncName) {
      // The run array may have null values depending on the chain & configured options.
      this.run = this.run.filter((fn) => !!fn)
      const { id } = this

      return async (pReq, pRes) => {
        // If the passed response object is undefined we can
        // infer that this was called from a SSR route.
        const type = pRes ? 'api' : 'ssr'

        // in SSR the pReq will actually be the `context` object
        // containing both the `req` and `res` objects, so
        // `pRes` will be undefined.
        let res = pRes
        let req = pReq
        let context = {}

        if (!pRes) {
          res = pReq.res
          req = pReq.req
          context = pReq
        }

        req[DEFAULT_OPTIONS.reqPropName] = {
          id,
          name: finalFuncName,
          type,
        }

        let runIndex = 0
        const RUNNER_STATES = {
          running: 'running',
          ended: 'ended',
          escaped: 'escaped',
          handled: 'handled',
          completed: 'completed',
        }
        let runnerState = RUNNER_STATES.running

        /**
         * This will handle state updates resulting from chain functions
         * and any pre-complete return values
         *
         * @param {*} arg
         * @param {*} payload
         * @returns
         */
        const runNext = (arg, payload) => {
          if (RUNNER_STATES.running) {
            switch (arg) {
            case 'route':
            case 'end':
              runnerState = RUNNER_STATES.ended

              return payload
            default:
              if (runIndex === this.run.length - 1) {
                runnerState = RUNNER_STATES.completed
              }

              return true
            }
          }

          return false
        }

        this.options.onMiddlewareStart(this.id)

        while (runnerState === RUNNER_STATES.running && runIndex < this.run.length) {
          let result

          if (!this.options.useAsyncMiddleware) {
            result = this.run[runIndex](req, res, runNext)
          }
          else {
            // eslint-disable-next-line no-await-in-loop
            result = await this.run[runIndex](req, res, runNext)
          }

          if (!result
            || (runnerState !== RUNNER_STATES.running && runnerState !== RUNNER_STATES.completed)
            || result.redirect) {
            runnerState = RUNNER_STATES.ended

            // Short-circuit-path exit of all middleware functionality
            console.debug('Short-circuit-path middleware exit (IMPLEMENT FINAL CALLBACK)')
            this.options.onMiddlewareComplete(this.id)
            this.options.onRouteComplete(this.id)

            return result
          }

          runIndex += 1
        }

        if (runnerState === RUNNER_STATES.completed) {
          if (res.finished) {
            console.warn('WARHING: Response is finished! Did you really mean to `return next()` after finishing the response?')
          }

          // return type === 'api' ? finalFunc(req, res) : finalFunc(context)

          const finalReturnFn = async () => {
            let finalReturn

            if (type === 'api') {
              finalReturn = await finalFunc(req, res)
            }
            else {
              finalReturn = await finalFunc(context)
            }

            // Happy-path exit of all middleware functionality
            console.debug('Happy-path middleware exit (IMPLEMENT FINAL CALLBACK)')
            this.options.onRouteComplete(this.id)

            return finalReturn
          }

          this.options.onMiddlewareComplete(this.id)

          return finalReturnFn()
        }

        // Unknown-path exit of all middleware functionality
        console.debig('Unknown-path middleware exit (IMPLEMENT FINAL CALLBACK)')
        this.options.onMiddlewareComplete(this.id)

        this.options.onRouteComplete(this.id)

        return undefined
      }
    }

    // This will be run when there is not current instance of
    // middleware for a given route. Depending on whether
    // `useChainOrder` is true, functions will be added to the
    // end of the `run` array, or inserted into the `run` array
    // in the order they are present in the `fnsArray` array.
    fnsArray.forEach((fn, i) => {
      const fnName = fn.name

      this.run.push(null)

      // eslint-disable-next-line func-names
      this[fnName] = function() {
        if (this.options.useChainOrder) {
          this.run.push(fnsArray[i])
        }
        else {
          this.run[i] = fnsArray[i]
        }

        return this
      }
    })
  }
}
