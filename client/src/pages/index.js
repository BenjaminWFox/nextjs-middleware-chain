import { useEffect, useState } from 'react'
import Index from '../components/pages/index'
// import middleware from '../middleware'

export default function Home() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    async function getUser() {
      const response = await fetch('http://localhost:3001/api/hello')
      const user = await response.json()

      setUser(user.name)
    }

    getUser()
  }, [])

  return (<Index />)
}
