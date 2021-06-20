import middleware from '../../../middleware'

const apiFetch = (req, res) => {
  console.log('Running apiFetch', req._ncm)

  res.status(200).json({ data: 'API Fetch Return' })
}

export default middleware().fnB().fnD().fnA().finish(apiFetch, 'API Fetch')
// export default middleware().decorate().protect().log().finish(apiFetch, `API Fetch`)