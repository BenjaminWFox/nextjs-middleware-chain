import middleware from '../../../middleware'

const apiFetch = (req, res) => {
  console.info('Running apiFetch', req._nmc)

  res.status(200).json({ data: 'API Fetch Return' })
}

export default middleware()
// .fnB()
// .unauthorized()
// .fnD()
// .fnA()
  .decorate()
  .common()
  .finish(apiFetch, 'API Fetch')
