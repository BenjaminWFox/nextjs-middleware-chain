import { createMiddleware } from '../../../src/index'

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

const log = (context) => {
  console.log('Running logging...', context.name)

  return context
}

const decorate = (context) => {
  console.log('Running decoration...')
  const {fn, name, req, res} = context
  const _ncm = { hello: 'world'}
  const decoratedReq = req

  decoratedReq._ncm = _ncm

  return {fn, name, req: decoratedReq, res}
}

const middleware = {
    protect,
    log,
    decorate,
}
const options = {
  keepOrder: true,
}

export default createMiddleware(middleware, options)