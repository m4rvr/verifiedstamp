import type { App } from 'firebase-admin/app'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import type { VercelRequest } from '@vercel/node'

let app: App | undefined

if (!getApps().length) {
  app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL
    })
  })
}

export const auth = getAuth(app)

export async function getFirebaseUserUid(request: VercelRequest) {
  if (!request.headers.authorization) return
  const token = request.headers.authorization.replace('Bearer ', '')
  const verifiedToken = await auth.verifyIdToken(token)
  if (!verifiedToken) return
  return verifiedToken.uid
}
