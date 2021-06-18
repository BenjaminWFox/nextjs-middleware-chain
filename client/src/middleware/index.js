import { createMiddleware } from '../../../src/index'

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const protect = (context) => {
  console.log('Running protection...', context.name)
  const { req, res } = context

  if (req.body.username) {
    console.log('SEND RES')
    res.status(401).json({ message: 'unauthorized' })

    return null
  }
  else {
    return context
  }
}

const log = async (context) => {
  console.log('Running logging...', context.name)

  const result = await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

  console.log('moving on...')

  return context
}

const decorate = (context) => {
  console.log('Running decoration...')
  const {fn, name, req, res} = context
  const decoratedReq = req

  // decoratedReq.ncm.add({ hello: 'world', id: uuidv4() })
  const _ncm = { hello: 'world', id: uuidv4() }
  decoratedReq._ncm = _ncm
  // decoratedReq._ncm.id = uuidv4()

  return {fn, name, req: decoratedReq, res}
}

const shortCircuitApi = (context) => {
  const {res} = context

  res.status(500).json({ message: 'Could not continue.' })

  return null
}

const shortCircuitSsr = (context) => {
  console.log('Short Circuit SSR')
  
  return { message: 'Could not continue.' }
}

const middleware = {
    protect,
    log,
    decorate,
    shortCircuitApi,
    shortCircuitSsr,
}
const options = {
  useChainOrder: true,
  useAsyncMiddleware: true,
}

export default createMiddleware(middleware, options)