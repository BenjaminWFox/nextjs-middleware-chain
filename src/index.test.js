import { createMiddleware } from '.'
import { Middleware, DEFAULT_OPTIONS } from './middleware'

let goodMWFns
let badMWFnsArrow
let badMWFnsFunc
let error

beforeEach(() => {
  const fnA = () => {}
  const fnB = function fnB() {}
  const fnC = function fnC() {}
  const fnD = () => {}

  badMWFnsArrow = [
    fnA,
    () => {}
  ]

  badMWFnsFunc = [
    fnB,
    function() {}
  ]

  goodMWFns = [
    fnA,
    fnB,
    fnC,
    fnD,
  ]
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
    error = undefined

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

  it('Should throw an unnamed function is provided in the functions array', () => {
    try {
      createMiddleware(badMWFnsArrow)
      expect(1).toBe(2) // never hit
    }
    catch (e) {
      error = e
    }

    expect(error).toBeDefined()
    error = undefined

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
    const middlewareFactory = createMiddleware(goodMWFns)
    const middlewareInstance = middlewareFactory()

    expect(typeof middlewareFactory).toBe('function')
    expect(middlewareInstance).toBeInstanceOf(Middleware)
  })
})

describe('The Middleware class and its instances', () => {
  let middlewareFactory
  let middlewareInstance

  beforeEach(() => {
    middlewareFactory = createMiddleware(goodMWFns)
    middlewareInstance = middlewareFactory()
  })

  it('Should have a property for each function in the functions array that is a function', () => {
    console.log(middlewareInstance)

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
