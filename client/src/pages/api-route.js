import { useEffect, useState } from 'react'
import Index from '../components/pages/index'
// import middleware from '../middleware'

export default function Home() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    async function getUser() {
      const responses = await Promise.all([
        fetch('http://localhost:3001/api/apiRoute/apiFetch'),
        // fetch('http://localhost:3001/api/apiRoute/apiFetch'),
        // fetch('http://localhost:3001/api/apiRoute/apiFetch'),
        // fetch('http://localhost:3001/api/apiRoute/apiFetch'),
        // fetch('http://localhost:3001/api/apiRoute/apiFetch'),
        // fetch('http://localhost:3001/api/apiRoute/apiFetch'),
        // fetch('http://localhost:3001/api/apiRoute/apiFetch'),
        // fetch('http://localhost:3001/api/apiRoute/apiFetch'),
        // fetch('http://localhost:3001/api/apiRoute/apiFetch'),
        // fetch('http://localhost:3001/api/apiRoute/apiFetch'),
        // fetch('http://localhost:3001/api/apiRoute/apiFetch'),
        // fetch('http://localhost:3001/api/apiRoute/apiFetch'),
        // fetch('http://localhost:3001/api/apiRoute/apiFetch'),
        // fetch('http://localhost:3001/api/apiRoute/apiFetch'),
        // fetch('http://localhost:3001/api/apiRoute/apiFetch'),
        // fetch('http://localhost:3001/api/apiRoute/apiFetch'),
        // fetch('http://localhost:3001/api/apiRoute/apiFetch'),
        // fetch('http://localhost:3001/api/apiRoute/apiFetch'),
        // fetch('http://localhost:3001/api/apiRoute/apiFetch'),
        // fetch('http://localhost:3001/api/apiRoute/apiFetch'),
        // fetch('http://localhost:3001/api/apiRoute/apiFetch'),
        // fetch('http://localhost:3001/api/apiRoute/apiFetch'),
        // fetch('http://localhost:3001/api/apiRoute/apiFetch'),
        // fetch('http://localhost:3001/api/apiRoute/apiFetch'),
      ])

      console.log('Responses', responses)

      const datas = []
      // responses.forEach(response => {
      //   const data = await response.json()
      //   datas.push(data)
      // })

      setUser('done')
    }

    getUser()
  }, [])

  return (<Index />)
}
