import type { VercelRequest, VercelResponse } from '@vercel/node'
import { PrismaClient } from '@prisma/client'
import { getFirebaseUserUid } from '../src/firebase-admin'
import { getTwitterClient } from '../src/twitter'

const prisma = new PrismaClient()

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'GET') {
    return response.status(500).send('Not available.')
  }

  const firebaseUid = await getFirebaseUserUid(request)

  if (!firebaseUid) {
    return response.status(401).send('Unauthorized.')
  }

  const user = await prisma.user.findUnique({
    where: {
      firebaseUid
    }
  })

  if (!user) {
    return response.status(401).send('Unauthorized.')
  }

  const twitterClient = getTwitterClient(user.oauthToken, user.oauthTokenSecret)
  const twitterUser = await twitterClient.currentUser()

  return response
    .status(200)
    .setHeader('Content-Type', 'application/json')
    .send(JSON.stringify(twitterUser))
}
