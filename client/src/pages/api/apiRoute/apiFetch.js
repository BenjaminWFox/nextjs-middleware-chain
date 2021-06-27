import middleware, { preBuiltChain } from '../../../middleware'

const apiFetch = (req, res) => {
  console.info('Running apiFetch', req.nmc)

  res.status(200).json({ data: 'API Fetch Return' })
}

// export default middleware()
//   // .fnB()
//   // .unauthorized()
//   .fnD()
//   // .skipRemainingMiddleware()
//   .fnA()
//   .common()
//   .decorate()
//   .finish(apiFetch, 'API Fetch')

export default preBuiltChain.fnD().finish(apiFetch, 'API Fetch PreBuilt')