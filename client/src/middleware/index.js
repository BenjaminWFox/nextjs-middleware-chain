import { createMiddleware } from '../../../src/index'
// import { createMiddleware } from '../../../dist/main'
// import { createMiddleware } from 'nextjs-middleware-chain'

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const fnA = (req, res, next) => {
  console.log('Running A', next)

  return next('A')
}

const fnB = async (req, res, next) => {
  console.log('Running B', next)

  const result = await new Promise(resolve => setTimeout(resolve, 2000));
  
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
  req.nmc.secondId = uuidv4()

  return next()
}

const unauthorized = (req, res, next) => {
  if (req.nmc.type === 'api') {
    res.status(401).json({error: 'unauthorize', message: 'access denied'})
  } else if (req.nmc.type === 'ssr') {
    return next('end', {
      redirect: {
        destination: '/',
        permanent: false,
      }
    })
  }
}

const common = async (req, res, next) => {
  const aRes = fnA(req, res, next)
  console.log('aRes', aRes)

  const bRes = await fnB(req, res, next)
  console.log('bRes', bRes)

  const authRes = unauthorized(req, res, next)

  console.log('Finishing common', req.nmc)

  if (authRes) {
    return authRes
  }
}

const middleware = [
  fnA,
  fnB,
  fnC,
  fnD,
  fnEndWithEnd,
  unauthorized,
  decorate,
  common
]

const options = {
  useChainOrder: true,
  useAsyncMiddleware: true,
}

export default createMiddleware(middleware, options)