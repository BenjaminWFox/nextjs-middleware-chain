// import { createMiddleware } from '../../../src/index'
import { createMiddleware } from 'nextjs-middleware-chain'

const fnA = (req, res, next) => {
  console.log('Running A', next)

  return next('A')
}

const fnB = async (req, res, next) => {
  console.log('Running B', next)

  const result = await new Promise((resolve) => setTimeout(resolve, 2000))

  return next('B')
}

const fnC = (req, res, next) => {
  console.log('Running C', next)

  return next('C')
}

const fnD = (req, res, next) => {
  console.log('Running D', next)

  return next('D')
}

const fnEndWithEnd = (req, res, next) => {
  console.log('Running fnEndWithEnd', next)

  return next('end')
}

const decorate = (req, res, next) => {
  console.log('Running decoration...')

  req.nmc.hello = 'world'
  req.nmc.secondId = 'custom-added-id'

  return next()
}

const unauthorized = (req, res, next) => {
  if (req.nmc.type === 'api') {
    res.status(401).json({ error: 'unauthorize', message: 'access denied' })
  }
  else if (req.nmc.type === 'ssr') {
    return next('end', {
      redirect: {
        destination: '/',
        permanent: false,
      }
    })
  }

  /**
   * This is not required for this hypothetical
   * example but would be the 'authorized' case
   */
  // return next()
}

const common = async (req, res, next) => {
  const aReturn = fnA(req, res, next)

  console.log('aRes', aReturn)

  const bReturn = await fnB(req, res, next)

  console.log('bRes', aReturn)

  const authReturn = unauthorized(req, res, next)

  console.log('Finishing common for', req.nmc.name)

  if (authReturn) {
    return authReturn
  }
}

const skipRemainingMiddleware = (req, res, next) => {
  console.log('Skipping Remaining Middlewares...')

  return next('route')
}

const middlewareFunctionsArray = [
  fnA,
  fnB,
  fnC,
  fnD,
  fnEndWithEnd,
  unauthorized,
  decorate,
  common,
  skipRemainingMiddleware,
]

const optionsObject = {
  useChainOrder: true,
  useAsyncMiddleware: true,
  reqPropName: 'nmc',
  onMiddlewareStart: (req) => {
    console.debug('Callback onMiddlewareStart for', req.nmc.name)
  },
  onMiddlewareComplete: (req) => {
    console.debug('Callback onMiddlewareComplete for', req.nmc.name)
  },
  onRouteComplete: (req) => {
    console.debug('Callback onRouteComplete for', req.nmc.name)
  },
}

const mwFactory = createMiddleware(middlewareFunctionsArray, optionsObject)

const preBuiltChain = mwFactory().fnA().fnB().fnC()

export { preBuiltChain }
export default mwFactory
