import { useEffect, useState } from 'react'
import Index from '../components/pages/index'

export default function Home() {
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

      console.into('Responses', responses)
    }

    getUser()
  }, [])

  return (<Index />)
}
