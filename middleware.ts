import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'


const authEndpointPaths = ['/api/_auth/']
const requireTokenPaths = ['/api/']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // skip for auth endpoints
  if (authEndpointPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }
  
  if (requireTokenPaths.some((path) => pathname.startsWith(path))) {
    // get token from request header
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return new NextResponse(JSON.stringify({ error: 401, status: "Unauthorized" }), { status: 401 })
    }
    
    // check token
    const verifyResponse = await fetch('http://localhost:3000/api/_auth/verifyToken', { headers: { Authorization: `Bearer ${token}` } })
    if(!verifyResponse.ok) {
      return new NextResponse(JSON.stringify({ error: 401, status: "Unauthorized" }), { status: 401 })
    }

    return NextResponse.next()
  }
}
