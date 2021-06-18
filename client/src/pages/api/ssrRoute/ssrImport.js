import middleware from '../../../middleware'

const ssrImport = async (req, res) => {
  console.log('Running ssrImport', req._ncm)

  const done = await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

  return { data: 'SSR Import Return' }
}

export default ssrImport

// export default middleware().log().decorate().protect().finish(ssrImport, `SSR Import`)