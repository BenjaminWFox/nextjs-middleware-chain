const ssrImport = async (req) => {
  console.info('Running ssrImport', req.nmc.name)

  // const done = await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

  return { data: 'SSR Import Return' }
}

export default ssrImport
