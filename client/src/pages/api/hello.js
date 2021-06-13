// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

// import withMiddleware from '../../../../src'
import middleware2 from '../../middleware'

const helloApi = (req, res) => {
  console.log('Running helloAPI', req._ncm)

  res.status(200).json({ name: 'John Doe' })
}

export default middleware2().decorate().protect().log().finish(helloApi, "Hello API")