import type { VercelRequest, VercelResponse } from '@vercel/node'
import { PrismaClient } from '@prisma/client'
import busboy from 'busboy'
import { getFirebaseUserUid } from '../src/firebase-admin'
import { getTwitterClient } from '../src/twitter'

const prisma = new PrismaClient()

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(500).send('Not available.')
  }

  const bb = busboy({
    headers: request.headers,
    limits: {
      files: 1
    }
  })

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

  let buffer: Buffer | null = null

  bb.on('file', (name, file) => {
    const chunks: Uint8Array[] = []

    file.on('data', async (chunk) => {
      chunks.push(chunk)
    })

    file.on('close', () => {
      buffer = Buffer.concat(chunks)
    })
  })

  bb.on('close', async () => {
    if (!buffer) {
      return response.status(422).send('Missing image.')
    }

    try {
      const updatedUser = await twitterClient.v1.updateAccountProfileImage(
        buffer
      )

      return response
        .status(200)
        .setHeader('Content-Type', 'application/json')
        .send(JSON.stringify(updatedUser))
    } catch (error) {
      console.error(error)
    }
  })

  request.pipe(bb)
}
