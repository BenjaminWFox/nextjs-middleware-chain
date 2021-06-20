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

beforeEach(() => {
  const fnA = (req, res, next) => next('Ran A')
  const fnB = function fnB() {}
  const fnC = function fnC() {}
  const fnD = () => {}

  badMWFnsArrow = [
    fnA,
    () => {}
  ]

  badMWFnsFunc = [
    fnB,
    function() {} // eslint-disable-line func-names
  ]

  goodMWFns = [
    fnA,
    fnB,
    fnC,
    fnD,
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

describe('The return of `createMiddleware` factory factory function', () => {
  it('Should return a function that creates a new instance of Middleware', () => {
    expect(typeof middlewareFactory).toBe('function')
    expect(middlewareInstance).toBeInstanceOf(Middleware)
  })
})

describe('The Middleware class and its instances', () => {
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

describe('The MW Class `finish` method', () => {
  it('should run as API type', async () => {
    const nmc = {
      id: undefined,
      name: 'Final Func',
      type: 'api',
    }
    const finalFunc = jest.fn()
    const req = jest.fn().mockReturnValue()
    const res = jest.fn().mockReturnValue()
    const mwInstance = middlewareFactory({ useAsyncMiddleware: false }).fnA()
    const rollup = mwInstance.finish(finalFunc, nmc.name)

    // Expect that it will trim all null values from run array
    expect(mwInstance.run.length).toBe(1)
    expect(mwInstance.run[0].name).toBe('fnA')

    await rollup(req, res)

    expect(finalFunc).toBeCalledTimes(1)
    expect(finalFunc).toHaveBeenLastCalledWith({ ...req, nmc }, { ...res })
  })

  it('should run as SSR type', async () => {
    const nmc = {
      id: undefined,
      name: 'Final Func',
      type: 'ssr',
    }
    const finalFunc = jest.fn()
    const req = jest.fn().mockReturnValue({ req: 'req' })
    const res = jest.fn().mockReturnValue({ res: 'res' })
    const mwInstance = middlewareFactory({ useAsyncMiddleware: false }).fnA()
    const rollup = mwInstance.finish(finalFunc, nmc.name)

    // Expect that it will trim all null values from run array
    expect(mwInstance.run.length).toBe(1)
    expect(mwInstance.run[0].name).toBe('fnA')

    await rollup({ req, res })

    expect(finalFunc).toBeCalledTimes(1)
    expect(finalFunc).toHaveBeenLastCalledWith({ req: { ...req, nmc }, res: { ...res } })
  })

  it('should run with the `req`, `res`, and `next` arguments', () => {

  })
})

describe('The functions added to the middleware instance for chained running', () => {
  let mwFactory

  beforeEach(() => {
    mwFactory = createMiddleware(goodMWFns)
  })

  it(`Should add a function to the end of the 'run' array
  in chained order when 'useChainOrder' is true`, () => {
    const mwInstance = mwFactory().fnC().fnA()

    expect(mwInstance.run[0]).toBeNull()
    expect(mwInstance.run[1]).toBeNull()
    expect(mwInstance.run[2]).toBeNull()
    expect(mwInstance.run[3]).toBeNull()
    expect(mwInstance.run[4].name).toBe('fnC')
    expect(mwInstance.run[5].name).toBe('fnA')
    expect(mwInstance.run[6]).toBeUndefined()
  })

  it(`Should add a function to the 'run' array at the same order as
  the initial functions array when 'useChainOrder' is false`, () => {
    const mwInstance = mwFactory({ useChainOrder: false }).fnC().fnA()

    expect(mwInstance.run[0].name).toBe('fnA')
    expect(mwInstance.run[1]).toBeNull()
    expect(mwInstance.run[2].name).toBe('fnC')
    expect(mwInstance.run[3]).toBeNull()
    expect(mwInstance.run[5]).toBeUndefined()
  })
})
