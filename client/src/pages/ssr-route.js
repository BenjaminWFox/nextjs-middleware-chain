import Index from '../components/pages/index'
import middleware, { preBuiltChain } from '../middleware'
import ssrImport from './api/ssrRoute/ssrImport'

export default function Home() {
  return (<Index />)
}

async function getProps({ req, res }) {
  console.info('SSR GET PROPS')

  const responses = await Promise.all([
    ssrImport(req, res),
  ])

  console.info('Responses', responses)

  return {
    props: {
      data: 'SSR Props Return',
    }
  }
}

// export const getServerSideProps = getProps

export const getServerSideProps = middleware()
  .fnB()
  // .unauthorized()
  .skipRemainingMiddleware()
  .fnD()
  .fnA()
  .decorate()
  // .common()
  .finish(getProps, 'SSR Import')

// export const getServerSideProps = preBuiltChain
// .fnD()
// .finish(getProps, 'SSR Import PreBuilt')
