const DEFAULT_OPTIONS = {
  useChainOrder: true,
  useAsyncMiddleware: true,
}

const middlewareAsyncInternals = function middlewareAsyncInternals(fnsArray, globalOptions) {
  console.log('Available Functions:', fnsArray)

  class Middleware {
    constructor(inlineOptions) {
      this.options = {
        ...DEFAULT_OPTIONS,
        ...globalOptions,
        ...inlineOptions,
      }
      this.run = []
      this.id = uuidv4()
      this.finish = function (finalFunc, finalFuncName) {
        this.run = this.run.filter((fn) => !!fn)
        console.log('Finishing MW for id: ', this.id)
        console.log('  -  Functions to run:', this.run)
        const id = this.id
  
        return async (pReq, pRes) => {
          // If the passed response object is undefined we can
          // infer that this was called from a SSR route.
          let type = pRes ? 'api' : 'ssr'

          // in SSR the pReq will actually be the `context` object
          // containing both the `req` and `res` objects
          const res = {
            ...(pRes ? pRes : pReq.res),
          }
          const req = {
            // I don't know that I really approve of this
            ...(pRes ? pReq : pReq.req),
            // Add a lib-specific decoration to the request
            _nmc: {
              id,
              name: finalFuncName,
              type,
            }
          }
          let runIndex = 0
          let escape = false
          const RUNNER_STATES = {
            running: 'running',
            ended: 'ended',
            escaped: 'escaped',
            handled: 'handled',
            completed: 'completed',
          }
          let runnerState = RUNNER_STATES.running

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
          }

          while (runnerState === RUNNER_STATES.running && runIndex < this.run.length) {
            let result
            if (!this.options.useAsyncMiddleware) {
              result = this.run[runIndex](req, res, runNext)
            } else {
              result = await this.run[runIndex](req, res, runNext)
            }

            console.log(result)

            if (!result || (runnerState !== RUNNER_STATES.running && runnerState !== RUNNER_STATES.completed)) {
              runnerState = RUNNER_STATES.ended

              return result
            }

            runIndex += 1
          }

          console.log('Finished with function runner', this.id)
  
          if (runnerState === RUNNER_STATES.completed) {
            return type === 'api' ? finalFunc(req, res) : finalFunc({req, res})
          }
        }
      }

      // This will be run when there is not current instance of 
      // middleware for a given route
      fnsArray.forEach((fn, i) => {
        const fnName = fn.name
        this.run.push(null)
        this[fnName] = function() {
          console.log('options', this.options)
          if (this.options.useChainOrder) {
            this.run.push(fnsArray[i])
          } else {
            this.run[i] = fnsArray[i]
          }
    
          return this
        }
      })
    }
  }

  // Inline options will overwrite global options
  return (inlineOptions) => new Middleware(inlineOptions)
}

const middlewareInternals = () => ({
  run: [],
  // tying it all together:
  finish: function (fn, name) {
    console.log('FINISH:')

    return (req, res) => {
      console.log('FINSIH RETURN:')
      let keepRunning = true

      for (const withFn of this.run) {
        if (withFn !== null) {
          console.log('Run Fn')
          keepRunning = withFn({fn, name, req, res});

          if (!keepRunning) {
            break
          }
        }
      }

      if (keepRunning) fn(req, res);
    };
  }
})

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * @typedef MiddlewareInternals
 * @type {object}
 * @property {array}      run       Array of fnName functions to be run
 * @property {function}   finish    
 * @property {functions}  [fnName]  
 */

/**
 * @typedef ContextObject
 * @type {object}
 * @property {function} fn    The api function 
 * @property {string}   name  The name of the api function 
 * @property {object}   req   Node http request object
 * @property {object}   re2   Node http response object
 */

/**
 * @typedef MiddlewareFunction
 * @type {function}
 * @property {ContextObject}  context   object containing the context
 * @returns {ContextObject}
 */

/**
 * @typedef MiddlewareOptions
 * @type {object}
 * @property {bool} useChainOrder       Should chained functions be run in chain order (vs initial creation order). Default: TRUE
 * @property {bool} useAsyncMiddleware  Should middleware functions be able to run asynchronously? Default: FALSE
 */

/**
 * This is run once on creation. It return a 
 * @param {object} fnsObj   A collection of functions
 * @param {object} options  An object options
 * @returns 
 */
export const createMiddleware = (fnsArray, options) => {
  console.log('')
  console.log('START createMiddleware')

  return middlewareAsyncInternals(fnsArray, options)
}

export const configureMiddleware = () => {
  
}
