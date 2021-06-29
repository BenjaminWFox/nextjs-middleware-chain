import '@babel/polyfill'
import { createMiddleware } from '.'
import './uuid'
import { Middleware, DEFAULT_OPTIONS } from './middleware'

jest.mock('./uuid')

/**
 * SET UP FUNCTION COLLECTIONS
 */
let goodMWFns
let badMWFnsArrow
let badMWFnsFunc
let error

let fnASpy
let fnBSpy
let fnCSpy
let fnDSpy
let fnSkipAllSpy
let fnSkipMwSpy

beforeEach(() => {
  fnASpy = jest.fn()
  fnBSpy = jest.fn()
  fnCSpy = jest.fn()
  fnDSpy = jest.fn()
  fnSkipAllSpy = jest.fn()
  fnSkipMwSpy = jest.fn()

  const fnA = (req, res, next) => {
    fnASpy()

    return next('Ran A')
  }
  const fnB = function fnB(req, res, next) {
    fnBSpy()

    return next('Ran B')
  }
  const fnC = function fnC(req, res, next) {
    fnCSpy()

    return next('Ran C')
  }
  const fnD = (req, res, next) => {
    fnDSpy()

    return next('Ran D')
  }
  const fnSkipRemainingAll = (req, res, next) => {
    fnSkipAllSpy()

    return next('EnD')
  }
  const fnSkipRemainingMiddleware = (req, res, next) => {
    fnSkipMwSpy()

    return next('rOutE')
  }

  badMWFnsArrow = [
    fnA,
    () => { }
  ]

  badMWFnsFunc = [
    fnB,
    function() { } // eslint-disable-line func-names
  ]

  goodMWFns = [
    fnA,
    fnB,
    fnC,
    fnD,
    fnSkipRemainingAll,
    fnSkipRemainingMiddleware
  ]
})

/**
 * SET UP MW FACTORY & INSTANCE
 */
let middlewareFactory
let middlewareInstance

beforeEach(() => {
  middlewareFactory = createMiddleware(goodMWFns)
  middlewareInstance = middlewareFactory()
})

describe('The basics of `createmiddleware` function', () => {
  it('Should throw error if an array of functions is not provided as the first argument', () => {
    try {
      createMiddleware()
      expect(1).toBe(2) // never hit
    }
    catch (e) {
      error = e
    }

    expect(error).toBeDefined()
    error = undefined // reset error

    try {
      createMiddleware([])
      expect(1).toBe(2) // never hit
    }
    catch (e) {
      error = e
    }

    expect(error).toBeDefined()
  })

  it('Should throw an error if a non-function is provided in the functions array', () => {
    try {
      createMiddleware([...goodMWFns, 'hi there'])
      expect(1).toBe(2) // never hit
    }
    catch (e) {
      error = e
    }

    expect(error).toBeDefined()
  })

  it('Should throw an error if an unnamed function is provided in the functions array', () => {
    try {
      createMiddleware(badMWFnsArrow)
      expect(1).toBe(2) // never hit
    }
    catch (e) {
      error = e
    }

    expect(error).toBeDefined()
    error = undefined // reset error

    try {
      createMiddleware(badMWFnsFunc)
      expect(1).toBe(2) // never hit
    }
    catch (e) {
      error = e
    }

    expect(error).toBeDefined()
  })
})

describe('The factory function factory function returned by `createMiddleware`', () => {
  it('Should return a function that creates a new instance of Middleware', () => {
    expect(typeof middlewareFactory).toBe('function')
    expect(middlewareInstance).toBeInstanceOf(Middleware)
  })
})

describe('Instances of `Middleware`', () => {
  it('Should have a property for each function in the functions array that is a function', () => {
    goodMWFns.forEach((fn) => {
      expect(middlewareInstance[fn.name]).toBeDefined()
      expect(typeof middlewareInstance[fn.name]).toBe('function')
    })
  })

  it('Should have global options defined', () => {
    Object.keys(DEFAULT_OPTIONS).forEach((key) => {
      expect(middlewareInstance.options[key]).toBeDefined()
    })
  })

  it('Should allow overwriting options at factory and instance levels', () => {
    const mwFactory = createMiddleware(goodMWFns, { useChainOrder: false })
    const mwInstance = mwFactory()
    const mwInstance2 = mwFactory({ useChainOrder: true })

    expect(mwInstance.options.useChainOrder).toBeFalsy()
    expect(mwInstance2.options.useChainOrder).toBeTruthy()
  })
})

describe('The `Middleware.finish` factory method', () => {
  describe('The `runnableMiddleware` returned by the `Middleware.finish` factory', () => {
    it('should run as API type when runnableMiddleware receives two arguments', async () => {
      const nmc = {
        id: undefined,
        name: 'Final Func',
        type: 'api',
      }
      const finalFunc = jest.fn()
      const req = jest.fn().mockReturnValue()
      const res = jest.fn().mockReturnValue()
      const mwInstance = middlewareFactory({ useAsyncMiddleware: false }).fnA()
      const runnableMiddleware = mwInstance.finish(finalFunc, nmc.name)

      // Expect that it will trim all null values from run array
      expect(mwInstance.run.length).toBe(1)
      expect(mwInstance.run[0].name).toBe('fnA')

      await runnableMiddleware(req, res)

      expect(finalFunc).toBeCalledTimes(1)
      expect(finalFunc).toHaveBeenLastCalledWith(req, res)
    })

    it('should run as SSR type when runnableMiddleware receives a single argument', async () => {
      const nmc = {
        id: undefined,
        name: 'Final Func',
        type: 'ssr',
      }
      const finalFunc = jest.fn()
      const req = jest.fn().mockReturnValue({ req: 'req' })
      const res = jest.fn().mockReturnValue({ res: 'res' })
      const mwInstance = middlewareFactory({ useAsyncMiddleware: false }).fnA()
      const runnableMiddleware = mwInstance.finish(finalFunc, nmc.name)

      // Expect that it will trim all null values from run array
      expect(mwInstance.run.length).toBe(1)
      expect(mwInstance.run[0].name).toBe('fnA')

      await runnableMiddleware({ req, res })

      expect(finalFunc).toBeCalledTimes(1)
      expect(finalFunc).toHaveBeenLastCalledWith({ req, res })
    })
  })

  it('should run with the `req`, `res`, and `next` arguments', () => {

  })
})

describe('The `Middleware` class constructor', () => {
  let mwFactory

  beforeEach(() => {
    mwFactory = createMiddleware(goodMWFns)
  })

  describe('The `fnsArray.forEach` loop behavior', () => {
    it(`Should add a function to the end of the 'run' array
        in chained order when 'useChainOrder' is true`, () => {
      const mwInstance = mwFactory().fnC().fnA()
      const firstNamedIndex = goodMWFns.length

      expect(mwInstance.run[0]).toBeNull()
      expect(mwInstance.run[1]).toBeNull()
      expect(mwInstance.run[2]).toBeNull()
      expect(mwInstance.run[3]).toBeNull()
      expect(mwInstance.run[firstNamedIndex].name).toBe('fnC')
      expect(mwInstance.run[firstNamedIndex + 1].name).toBe('fnA')
    })

    it(`Should add a function to the 'run' array at the same order as
        the initial functions array when 'useChainOrder' is false`, () => {
      const mwInstance = mwFactory({ useChainOrder: false }).fnC().fnA()
      const firstUndefinedIndex = goodMWFns.length

      expect(mwInstance.run[0].name).toBe('fnA')
      expect(mwInstance.run[1]).toBeNull()
      expect(mwInstance.run[2].name).toBe('fnC')
      expect(mwInstance.run[3]).toBeNull()
      expect(mwInstance.run[firstUndefinedIndex]).toBeUndefined()
    })
  })
})

describe('The `Middleware` runner short-circuit methods', () => {
  let mwFactory

  beforeEach(() => {
    jest.resetAllMocks()

    mwFactory = createMiddleware(goodMWFns)
  })

  it('Should skip all remaining middleware AND Next.js route when a mw function returns `next("end")`', async () => {
    const routeFn = jest.fn()
    const mwChain = mwFactory()
      .fnA()
      .fnB()
      .fnSkipRemainingAll()
      .fnC()
      .fnD()

    const runnableMiddleware = mwChain.finish(routeFn, 'Route Function')

    await runnableMiddleware({}, {})

    expect(fnASpy).toHaveBeenCalledTimes(1)
    expect(fnBSpy).toHaveBeenCalledTimes(1)
    expect(fnCSpy).toHaveBeenCalledTimes(0)
    expect(fnDSpy).toHaveBeenCalledTimes(0)
    expect(routeFn).toHaveBeenCalledTimes(0)
  })

  it('Should skip any remaining middleware when a mw function returns `next("route")`', async () => {
    const routeFn = jest.fn()
    const mwChain = mwFactory()
      .fnA()
      .fnB()
      .fnSkipRemainingMiddleware()
      .fnC()
      .fnD()

    const runnableMiddleware = mwChain.finish(routeFn, 'Route Function')

    await runnableMiddleware({}, {})

    expect(fnASpy).toHaveBeenCalledTimes(1)
    expect(fnBSpy).toHaveBeenCalledTimes(1)
    expect(fnCSpy).toHaveBeenCalledTimes(0)
    expect(fnDSpy).toHaveBeenCalledTimes(0)
    expect(routeFn).toHaveBeenCalledTimes(1)
  })
})

describe('Multi-method patterns', () => {
  describe('Multiple middlewares run in a single middleware', () => {

  })

  describe('Multiple middlewares in a pre-built chain', () => {

  })
})
