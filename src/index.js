const middlewareAsyncInternals = function middlewareAsyncInternals() {
  return {
    run: [],
    // tying it all together:
    finish: function (finalFunc, finalFuncName) {
      console.log('FINISH Asnyc:')

      return async (originalRequest, originalResponse) => {
        console.log('FINSIH RETURN Asnyc:')
        let req = originalRequest
        let res = originalResponse
        let fn = finalFunc
        let name = finalFuncName

        let keepRunning = true

        for (const withFn of this.run) {
          if (withFn !== null) {
            ({req, res, fn, name} = await withFn({fn, name, req, res}))

            if (!req || !res || !fn || !name) {
              if (res) {
                res.status(500).json({error: 'missing property'})

                return null
              }
            }
          }
        }

        if (keepRunning) fn(req, res);
      };
    }
  }
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
export const createMiddleware = (fnsObj, options) => {
  console.log('createMiddleware start')

  const obj = fnsObj
  const fns = Object.keys(fnsObj)
  const mw = options.useAsyncMiddleware ?  middlewareAsyncInternals() : middlewareInternals()

  fns.forEach((fn, i) => {
    mw.id = uuidv4()
    mw.run.push(null)
    mw[fn] = function() {
      console.log('createMiddleware building functions', this)

      mw.run[i] = obj[fn]

      return this
    }
  })

  return () => mw
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

