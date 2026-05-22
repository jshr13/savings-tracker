import { headers } from 'next/headers'

export async function getRequestOrigin() {
  const requestHeaders = await headers()
  const host = requestHeaders.get('host')
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'

  if (!host) {
    throw new Error('Missing request host.')
  }

  return `${protocol}://${host}`
}

export async function getRequestCookieHeader() {
  const requestHeaders = await headers()

  return requestHeaders.get('cookie') ?? ''
}
