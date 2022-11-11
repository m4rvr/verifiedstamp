import {
  type JSX,
  Show,
  Suspense,
  createEffect,
  createResource,
  createSignal
} from 'solid-js'
import {
  type UserCredential as UserCredentialBase,
  deleteUser,
  getAdditionalUserInfo
} from 'firebase/auth'
import { Toaster, toast } from 'solid-toast'
import * as faceapi from '@vladmandic/face-api'
import { getCurrentUser, signInWithTwitter, signOut } from '#/firebase.js'
import verifiedUrl from '#/assets/verified.svg'

type UserCredential = UserCredentialBase & {
  _tokenResponse: {
    oauthAccessToken: string
    oauthTokenSecret: string
  }
}

export default function (): JSX.Element {
  const [user, { mutate: mutateUser }] = createResource(getCurrentUser)
  const [twitterUser, { mutate: mutateTwitterUser }] = createResource(
    user,
    async (user) => {
      const idToken = await user.getIdToken()
      return fetch('/api/get-twitter-user', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      }).then((r) => r.json())
    }
  )
  const signIn = async () => {
    const userCredential = (await signInWithTwitter()) as UserCredential
    const userInfo = getAdditionalUserInfo(userCredential)

    if (userInfo?.isNewUser) {
      try {
        const { oauthAccessToken: oauthToken, oauthTokenSecret } =
          userCredential._tokenResponse
        await fetch('/api/create-user', {
          method: 'POST',
          body: JSON.stringify({
            firebaseUid: userCredential.user.uid,
            oauthToken,
            oauthTokenSecret
          })
        }).then((res) => res.json())
      } catch (error) {
        console.error(error)
        // toast.error('Could not sign in.')
        deleteUser(userCredential.user)
      }
    }

    mutateUser(userCredential.user)
  }

  const [isStamped, setIsStamped] = createSignal(false)
  const [canvasRef, setCanvasRef] = createSignal<HTMLCanvasElement>()

  const photoUrl = () =>
    twitterUser()?.profile_image_url_https?.replace('_normal', '')

  createEffect(() => {
    if (!canvasRef() || !photoUrl()) return

    const context = canvasRef()!.getContext('2d')!
    const img = new Image()
    img.onload = () => {
      context.drawImage(img, 0, 0)
    }
    img.crossOrigin = 'anonymous'
    img.src = photoUrl()!
  })

  const addVerifiedStamp = async () => {
    if (isStamped()) {
      toast.error('You are already stamped with verification. Upload now!')
      return
    }

    const context = canvasRef()!.getContext('2d')!
    const img = new Image()
    img.onload = () => {
      const photo = new Image()
      const url = '../node_modules/@vladmandic/face-api/model'
      photo.onload = async () => {
        await faceapi.nets.ssdMobilenetv1.loadFromUri(url)

        const detections = await faceapi.detectAllFaces(
          photo,
          new faceapi.SsdMobilenetv1Options({
            minConfidence: 0
          })
        )

        if (detections.length) {
          // Faces detected
          for (const detection of detections) {
            const { x: boxX, y: boxY, width, height } = detection.box
            const size = Math.max(width, height)
            const x = boxX + width / 2 - size / 2
            const y = boxY + height / 2 - size / 2 - size * 0.1
            context.drawImage(img, x, y, size, size)
          }
        } else {
          // No faces detected
          context.drawImage(
            img,
            photo.width / 2 - img.width / 2,
            photo.height / 2 - img.height / 2
          )
        }

        setIsStamped(true)
        toast.success('Image ready to upload!')
      }
      photo.crossOrigin = 'anonymous'
      photo.src = photoUrl()!
    }
    img.crossOrigin = 'anonymous'
    img.src = verifiedUrl
  }

  const uploadToTwitter = async () => {
    canvasRef()!.toBlob(async (blob) => {
      const formData = new FormData()
      formData.append('image', blob!)

      const idToken = await user()!.getIdToken()

      try {
        await fetch('/api/update-profile-image', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${idToken}`
          },
          body: formData
        }).then((res) => res.json())

        toast.success('You are now (un)officially verified!')
      } catch (error) {
        toast.error('Could not upload image.')
      }
    })
  }

  return (
    <>
      <div class="flex h-full min-h-screen flex-col items-center justify-center">
        <Suspense fallback={<p class="text-xl">Loading...</p>}>
          <Show
            when={user()}
            fallback={
              <button
                onClick={signIn}
                class="rounded-lg bg-neutral-900 px-4 py-2 text-white"
              >
                Sign in with Twitter
              </button>
            }
          >
            <div class="mb-8 flex items-center justify-between gap-12">
              <div class="flex flex-col gap-1">
                <strong>Signed in as: </strong>
                {twitterUser()?.name}
              </div>
              <button
                onClick={async () => {
                  signOut()
                  mutateUser(null)
                  mutateTwitterUser(null)
                }}
                class="rounded-lg bg-neutral-900 px-4 py-2 text-white"
              >
                Sign out
              </button>
            </div>
            <div class="mb-4">
              <canvas
                ref={setCanvasRef}
                width="368"
                height="368"
                onClick={addVerifiedStamp}
              />
            </div>
            <button
              class="mt-4 rounded-lg bg-neutral-900 px-4 py-2 text-white"
              classList={{
                'opacity-50': !isStamped()
              }}
              disabled={!isStamped()}
              onClick={uploadToTwitter}
            >
              Upload to Twitter
            </button>
          </Show>
        </Suspense>
      </div>
      <Toaster />
    </>
  )
}
