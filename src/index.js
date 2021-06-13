const middlewareInternals = (req, res) => ({
  run: [],
  // tying it all together:
  finish: function (fn, name) {
    return (req, res) => {
      let keepRunning = true
      for (const withFn of this.run) {
        if (withFn !== null) {
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

export const createMiddleware = (fnsObj, options) => {
  const obj = fnsObj
  const fns = Object.keys(fnsObj)
  const mw = middlewareInternals()

  fns.forEach((fn, i) => {
    mw.run.push(null)
    mw[fn] = function() {
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

