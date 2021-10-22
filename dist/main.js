'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);

    if (enumerableOnly) {
      symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    }

    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

/**
 * This will not create a cryptographic quality GUID, but is sufficient
 * for identifying separate instances of `Middleware` if necessary.
 *
 * @returns a guid-like string
 */

/* eslint-disable */
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
}
/* eslint-enable */

/**
* @typedef MiddlewareOptions
* @type {object}
* @property {bool} useChainOrder       Should chained functions be run in chain order (vs initial creation order). Default: TRUE
* @property {bool} useAsyncMiddleware  Should middleware functions be able to run asynchronously? Default: FALSE
*/

var DEFAULT_OPTIONS = {
  useChainOrder: true,
  useAsyncMiddleware: true,
  reqPropName: 'nmc',
  onMiddlewareStart: function onMiddlewareStart() {},
  onMiddlewareComplete: function onMiddlewareComplete() {},
  onRouteComplete: function onRouteComplete() {}
};
var Middleware = function Middleware(fnsArray, globalOptions, inlineOptions) {
  var _this2 = this;

  _classCallCheck(this, Middleware);

  this.options = _objectSpread2(_objectSpread2(_objectSpread2({}, DEFAULT_OPTIONS), globalOptions), inlineOptions);
  this.run = [];
  this.id = uuidv4();

  this.finish = function finish(finalFunc, finalFuncName) {
    var _this = this;

    // The run array may have null values depending on the chain & configured options.
    this.run = this.run.filter(function (fn) {
      return !!fn;
    });
    var id = this.id;
    var friendlyName = finalFuncName || finalFunc.name;

    var runnableMiddleware = /*#__PURE__*/function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(pReq, pRes) {
        var type, res, req, context, runIndex, RUNNER_STATES, runnerState, runNext, result, finalReturnFn;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                // If the passed response object is undefined we can
                // infer that this was called from a SSR route.
                type = pRes ? 'api' : 'ssr'; // in SSR the pReq will actually be the `context` object
                // containing both the `req` and `res` objects, so
                // `pRes` will be undefined.

                res = pRes;
                req = pReq;
                context = {};

                if (!pRes) {
                  res = pReq.res;
                  req = pReq.req;
                  context = pReq;
                }

                req[_this.options.reqPropName] = {
                  id: id,
                  name: friendlyName,
                  type: type,
                  context: context
                };
                runIndex = 0;
                RUNNER_STATES = {
                  running: 'running',
                  ended: 'ended',
                  escaped: 'escaped',
                  handled: 'handled',
                  completed: 'completed'
                };
                runnerState = RUNNER_STATES.running;
                /**
                 * This will handle state updates resulting from chain functions
                 * and any pre-complete return values
                 *
                 * @param {*} arg
                 * @param {*} payload
                 * @returns
                 */

                runNext = function runNext(arg, payload) {
                  var returnedArg = (arg === null || arg === void 0 ? void 0 : arg.toLowerCase()) || '';

                  if (RUNNER_STATES.running) {
                    switch (returnedArg) {
                      case 'end':
                        runnerState = RUNNER_STATES.ended;
                        return payload;

                      case 'route':
                        runnerState = RUNNER_STATES.completed;
                        return true;

                      default:
                        if (runIndex === _this.run.length - 1) {
                          runnerState = RUNNER_STATES.completed;
                        }

                        return true;
                    }
                  }

                  return false;
                };

                _this.options.onMiddlewareStart(req);

              case 11:
                if (!(runnerState === RUNNER_STATES.running && runIndex < _this.run.length)) {
                  _context2.next = 28;
                  break;
                }

                result = void 0;

                if (_this.options.useAsyncMiddleware) {
                  _context2.next = 17;
                  break;
                }

                result = _this.run[runIndex](req, res, runNext);
                _context2.next = 20;
                break;

              case 17:
                _context2.next = 19;
                return _this.run[runIndex](req, res, runNext);

              case 19:
                result = _context2.sent;

              case 20:
                if (!(!result || runnerState !== RUNNER_STATES.running && runnerState !== RUNNER_STATES.completed || result.redirect)) {
                  _context2.next = 25;
                  break;
                }

                runnerState = RUNNER_STATES.ended; // Short-circuit-path exit of all middleware functionality
                // console.debug('Short-circuit-path middleware exit (IMPLEMENT FINAL CALLBACK)')

                _this.options.onMiddlewareComplete(req);

                _this.options.onRouteComplete(req);

                return _context2.abrupt("return", result);

              case 25:
                runIndex += 1;
                _context2.next = 11;
                break;

              case 28:
                if (!(runnerState === RUNNER_STATES.completed)) {
                  _context2.next = 33;
                  break;
                }

                if (res.finished) {
                  console.warn('WARHING: Response is finished! Did you really mean to `return next()` after finishing the response?');
                }

                finalReturnFn = /*#__PURE__*/function () {
                  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                    var finalReturn;
                    return regeneratorRuntime.wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            if (!(type === 'api')) {
                              _context.next = 6;
                              break;
                            }

                            _context.next = 3;
                            return finalFunc(req, res);

                          case 3:
                            finalReturn = _context.sent;
                            _context.next = 9;
                            break;

                          case 6:
                            _context.next = 8;
                            return finalFunc(context);

                          case 8:
                            finalReturn = _context.sent;

                          case 9:
                            // Happy-path exit of all middleware functionality
                            // console.debug('Happy-path middleware exit (IMPLEMENT FINAL CALLBACK)')
                            _this.options.onRouteComplete(req);

                            return _context.abrupt("return", finalReturn);

                          case 11:
                          case "end":
                            return _context.stop();
                        }
                      }
                    }, _callee);
                  }));

                  return function finalReturnFn() {
                    return _ref2.apply(this, arguments);
                  };
                }();

                _this.options.onMiddlewareComplete(req);

                return _context2.abrupt("return", finalReturnFn());

              case 33:
                // Unknown-path exit of all middleware functionality
                // console.debig('Unknown-path middleware exit (IMPLEMENT FINAL CALLBACK)')
                _this.options.onMiddlewareComplete(req);

                _this.options.onRouteComplete(req);

                return _context2.abrupt("return", undefined);

              case 36:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      return function runnableMiddleware(_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }();

    return runnableMiddleware;
  }; // This will be run when there is no existing instance of
  // middleware for a given route. Depending on whether
  // `useChainOrder` is true, functions will be added to the
  // end of the `run` array, or inserted into the `run` array
  // in the order they are present in the `fnsArray` array.


  fnsArray.forEach(function (fn, i) {
    var fnName = fn.name;

    _this2.run.push(null); // eslint-disable-next-line func-names


    _this2[fnName] = function () {
      if (this.options.useChainOrder) {
        this.run.push(fnsArray[i]);
      } else {
        this.run[i] = fnsArray[i];
      }

      return this;
    };
  });
};

/**
 * This is a factory function factory function.
 *
 * @param {*} fnsArray
 * @param {*} globalOptions
 *
 * @returns A factory function used to create new instances of the Middleware class
 */

var middlewareFactoryFactory = function middlewareFactoryFactory(fnsArray, globalOptions) {
  // Inline options will overwrite global options
  return function (inlineOptions) {
    return new Middleware(fnsArray, globalOptions, inlineOptions);
  };
};
/**
 * This is run once on creation. It return a factory function that
 * is, itself, a factory function for creating `Middleware` instances.
 *
 * @param {array}            functionsArray        A collection of functions
 * @param {MiddlewareOptions} globalOptionsObject   An object options
 *
 * @returns
 */


var createMiddleware = function createMiddleware(fnsArray) {
  var globalOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (!(fnsArray !== null && fnsArray !== void 0 && fnsArray.length)) {
    throw new Error('A functions array must be provided as the first argument.');
  }

  Object.values(fnsArray).forEach(function (fn) {
    if (typeof fn !== 'function') {
      throw new Error('Items in the functions array must be a function.');
    }

    if (!fn.name) {
      throw new Error('Items in the functions array must be named functions.');
    }
  });
  Object.keys(globalOptions).forEach(function (key) {
    if (!DEFAULT_OPTIONS[key]) {
      console.warn("Unknown option ".concat(key, " provided. Ignoring."));
    }
  });
  return middlewareFactoryFactory(fnsArray, globalOptions);
};

exports.createMiddleware = createMiddleware;
