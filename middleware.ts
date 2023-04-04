import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const port = process.env.PORT || 3000
const internalSecret = process.env.INTERNAL_SECRET || 'secret'

const internalEndpointPaths = ['/api/_internal/']
const requireTokenPaths = ['/api/']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // skip for auth endpoints
  if (internalEndpointPaths.some((path) => pathname.startsWith(path))) {
    if (request.headers.get('Internal') !== internalSecret) {
      return new NextResponse(JSON.stringify({ error: 401, status: "Unauthorized (Internal)" }), { status: 401 })
    }
    return NextResponse.next()
  }

  if (requireTokenPaths.some((path) => pathname.startsWith(path))) {
    // get token from request header
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return new NextResponse(JSON.stringify({ error: 401, status: "Unauthorized" }), { status: 401 })
    }

    // check token
    // This request is not guarded by the middleware, so we need to check the token manually on the api endpoint
    const verifyResponse = await fetch(`http://localhost:${port}/api/_internal/verifyToken`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Internal: `${internalSecret}`,
        }
      })
    if (!verifyResponse.ok) {
      return new NextResponse(JSON.stringify({ error: 401, status: "Unauthorized" }), { status: 401 })
    }

    return NextResponse.next()
  }
}
