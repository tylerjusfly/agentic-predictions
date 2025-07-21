'use client'

import { useEffect, useState } from 'react'


export default function PlaygroundPage() {
  const [iframeUrl, setIframeUrl] = useState('')

  // useEffect(() => {
  //   // Construct URL with auth token as query parameter
  //   const url = new URL(config.superglueEndpoint)
  //   url.searchParams.set('token', config.superglueApiKey)
  //   setIframeUrl(url.toString())
  // }, [config.superglueEndpoint, config.superglueApiKey])

  return (
    <div className="w-full h-screen">
      {iframeUrl && (
        <iframe 
          src={iframeUrl}
          className="w-full h-full border-0"
          allow="clipboard-write"
        />
      )}
    </div>
  )
}