const getNextFn = (arr, i) => {
  let j = i

  while (true) {
    if (arr[j]) {
      return { runFn: arr[j], nextIndex: j +1 }
    } else if (j === arr.length) {
      return {}
    }
    else {
      j += 1
    }
  }
}

const middlewareAsyncInternals = function middlewareAsyncInternals(fnsArray, options) {
  console.log('Start internals', fnsArray)

  class Middleware {
    constructor() {
      this.run = []
      this.id = uuidv4()
      this.finish = function (finalFunc, finalFuncName) {
        console.log('Finishing MW for id', this.id)
        const id = this.id
  
        return async (pReq, pRes) => {
          // If the passed response object is undefined we can
          // infer that this was called from a SSR route.
          let type = pRes ? 'api' : 'ssr'

          // in SSR the pReq will actually be the `context` object
          // containing both the `req` and `res` objects
          const res = pRes ?? pReq.res
          const req = {
            // I don't know that I really approve of this
            ...(pRes ? pReq : pReq.res),
            // Add a lib-specific decoration to the request
            _nmc: {
              id,
              name: finalFuncName,
              type,
            }
          }
          let runIndex = 0
          let escape = false

          const next = async (arg) => {
            if (arg) {
              switch (arg) {
                case 'route':
                  escape = true;
                default:
                  break
              }
            }
  
            const { runFn, nextIndex } = getNextFn(this.run, runIndex)
  
            runIndex = nextIndex
  
            if (runFn && !escape) {
              await runFn(req, res, next)
            }
          }
  
          await next()
  

          return type === 'api' ? finalFunc(req, res) : finalFunc({req, res})
        }
      }

      fnsArray.forEach((fn, i) => {
        const fnName = fn.name
        this.run.push(null)
        this[fnName] = function() {
          console.log('createMiddleware building functions', this)
    
          if (options.useChainOrder) {
            this.run.push(fnsArray[i])
          } else {
            this.run[i] = fnsArray[i]
          }
    
          return this
        }
      })
    }
  }

  return () => new Middleware()

  // return {
  //   id: uuidv4(),
  //   run: [],
  //   finish: function (finalFunc, finalFuncName) {
  //     console.log('Finishing MW for id', this.id)

  //     return async (pReq, pRes) => {
  //       const res = pRes
  //       const req = {
  //         ...pReq,
  //         _nmc: {
  //           name: finalFuncName,
  //           type: '',
  //         }
  //       }
  //       let runIndex = 0
  //       let escape = false
        
  //       const next = async (arg) => {
  //         if (arg) {
  //           switch (arg) {
  //             case 'route':
  //               escape = true;
  //             default:
  //               break
  //           }
  //         }

  //         const { runFn, nextIndex } = getNextFn(this.run, runIndex)

  //         runIndex = nextIndex

  //         if (runFn && !escape) {
  //           await runFn(req, res, next)
  //         }
  //       }

  //       await next()

  //       return finalFunc(req, res)
  //     }
  //   }
  // }
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
  console.log('START createMiddleware')

  // const obj = fnsObj
  // const fns = Object.keys(fnsObj)
  // const mw = options.useAsyncMiddleware ?  middlewareAsyncInternals() : middlewareInternals()
  // const availableFunctions = []
  // const functionRunners = {}

  // fnsArray.forEach((fn, i) => {
  //   const fnName = fn.name

  //   availableFunctions.push(null)
  //   functionRunners[fnName] = function() {
  //     console.log('createMiddleware building functions', this)

  //     if (options.useChainOrder) {
  //       mw.run.push(fnsArray[i])
  //     } else {
  //       mw.run[i] = fnsArray[i]
  //     }

  //     return this
  //   }

  //   // mw.id = uuidv4()
  //   // mw.run.push(null)
  //   // mw[fnName] = function() {
  //   //   console.log('createMiddleware building functions', this)

  //   //   if (options.useChainOrder) {
  //   //     mw.run.push(fnsArray[i])
  //   //   } else {
  //   //     mw.run[i] = fnsArray[i]
  //   //   }

  //   //   return this
  //   // }
  // })

  return middlewareAsyncInternals(fnsArray, options)
}

export const configureMiddleware = () => {
  
}

// /**
//  * Factory to produce a 'withMiddleware' object
//  */
//  export default () => ({
//   // middlewares will insert themselves into the array
//   // based on their specific priority:
//   run: [null, null, null],

//   // Primary middleware functions:
//   withProtect: (fn, name, req, res) => {
//     // console.log("Run protect");

//     return { fn, name, req, res };
//   },
//   withDecorate: (fn, name, req, res) => {
//     // console.log("Run decorate");

//     req.extra = { prop: "hello" };

//     return { fn, name, req, res };
//   },
//   withLog: (fn, name, req, res) => {
//     // console.log("Finally running log...");

//     return { fn, name, req, res };
//   },

//   // exposed, chainable functions:
//   protect: function () {
//     this.run[0] = this.withProtect;

//     return this;
//   },
//   decorate: function () {
//     this.run[1] = this.withDecorate;

//     return this;
//   },
//   log: function () {
//     this.run[2] = this.withLog;

//     return this;
//   },

//   // tying it all together:
//   finish: function (fn, name) {
//     return (req, res) => {
//       this.run.forEach((withFn) => {
//         if (withFn !== null) {
//           withFn(fn, name, req, res);
//         }
//       });

//       fn(req, res);
//     };
//   }
// });

