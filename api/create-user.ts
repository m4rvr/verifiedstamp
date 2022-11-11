import type { VercelRequest, VercelResponse } from '@vercel/node'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(500).send('Not available.')
  }

  const { firebaseUid, oauthToken, oauthTokenSecret } = JSON.parse(request.body)

  if (!firebaseUid || !oauthToken || !oauthTokenSecret) {
    return response.status(422).send('Missing user data.')
  }

  const createdUser = await prisma.user.create({
    data: {
      firebaseUid,
      oauthToken,
      oauthTokenSecret
    }
  })

  return response
    .status(200)
    .setHeader('Content-Type', 'application/json')
    .send(JSON.stringify(createdUser))
}
