import type { NextApiRequest, NextApiResponse } from 'next'
import jwt, { JwtHeader, SigningKeyCallback } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { jwksUrl, AAD_TENANT_ID, AAD_APP_ID, AAD_API_APP_SCOPE } from "@/auth.config";

const internalSecret = process.env.INTERNAL_SECRET || 'secret'

const client = jwksClient({
  jwksUri: `${jwksUrl}`,
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
});

async function getKey(header: JwtHeader, callback: SigningKeyCallback) {
  client.getSigningKey(header.kid, function (err, key) {
    var signingKey = key!.getPublicKey()
    callback(err, signingKey);
  });
}

async function verifyToken(token: string) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getKey, {}, function (err, decoded) {
      if (err) {
        console.error(err)
        reject(err)
      }
      // check decoded data
      if (!decoded) {
        return reject("No decoded data")
      }

      // check jwt payload
      const payload: jwt.JwtPayload = decoded as jwt.JwtPayload

      const aud = Array.isArray(payload.aud) ? payload.aud[0] : payload.aud
      const { iss, nbf = Number.MAX_SAFE_INTEGER, exp = 0, appid, scp} = payload

      // check aud
      if (!aud || !AAD_API_APP_SCOPE.includes(aud)) {
        return reject("Token is not for this app (aud)")
      }

      // check iss
      if (!iss || iss !== `https://sts.windows.net/${AAD_TENANT_ID}/`) {
        return reject("Token is not for this app (iss)")
      }

      // check appid
      if (!appid || appid !== AAD_APP_ID) {
        return reject("Token is not for this app (appid)")
      }

      // check nbf and exp
      const currentUnixTime = Math.floor(Date.now() / 1000);
      if (currentUnixTime < nbf) {
        return reject("Token is not valid yet")
      }
      if (currentUnixTime > exp) {
        return reject("Token is expired")
      }

      // check scp
      if (!scp || !AAD_API_APP_SCOPE.includes(scp)) {
        return reject("Token is not for this app (scp)")
      }

      resolve(decoded)
    });
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.split(' ')[1] || ""

  if(req.headers.internal !== internalSecret) {
    return res.status(401).json({ result: false, reason: "No internal secret" });
  }

  if (!token) {
    return res.status(401).json({ result: false, reason: "No token" });
  }
  try {
    const decoded = await verifyToken(token)
    return res.status(200).json({ result: true, decoded: decoded })
  } catch (err) {
    console.error(err)
    return res.status(401).json({ result: false, reason: err });
  }
}
