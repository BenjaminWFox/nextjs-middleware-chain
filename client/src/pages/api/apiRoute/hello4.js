// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// import withMiddleware from '../../../../src'
import middleware2 from '../../../middleware'

const helloApi = (req, res) => {
  console.log('Running helloAPI', req._ncm)

  res.status(200).json({ name: 'John Doe' })
}

export default middleware2().decorate().protect().log().finish(helloApi, `#4`)