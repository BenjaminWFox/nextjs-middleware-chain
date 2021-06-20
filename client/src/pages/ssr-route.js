import { useEffect, useState } from 'react'
import Index from '../components/pages/index'
import middleware from '../middleware'
import ssrImport from './api/ssrRoute/ssrImport'

export default function Home({ data }) {
  return (<Index />)
}

async function getProps({req, res}) {
  console.log('SSR GET PROPS')

  const responses = await Promise.all([
    ssrImport(req, res),
    // ssrImport(req, res),
    // ssrImport(req, res),
    // ssrImport(req, res),
    // ssrImport(req, res),
    // ssrImport(req, res),
    // ssrImport(req, res),
    // ssrImport(req, res),
    // ssrImport(req, res),
    // ssrImport(req, res),
    // ssrImport(req, res),
    // ssrImport(req, res),
  ])

  console.log('Responses', responses)

  return {
    props: {
      data: 'SSR Props Return',
    }
  }
}

// export const getServerSideProps = getProps
export const getServerSideProps = middleware().fnB().fnD().fnA().finish(getProps, 'SSR Import') 
// middleware().shortCircuitSsr().log().decorate().protect().finish(getProps, 'SSR Import')
