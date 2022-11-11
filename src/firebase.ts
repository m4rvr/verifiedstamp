import { type FirebaseApp, getApps, initializeApp } from 'firebase/app'
import {
  TwitterAuthProvider,
  type User,
  getAuth,
  onAuthStateChanged,
  signInWithPopup
} from 'firebase/auth'

let app: FirebaseApp | undefined

if (!getApps().length) {
  app = initializeApp({
    apiKey: 'AIzaSyBYlOpt2Z4XDfCcbesWPEPCO-7OI0Ij6Hs',
    authDomain: 'verifiedstamp-b2071.firebaseapp.com',
    projectId: 'verifiedstamp-b2071',
    storageBucket: 'verifiedstamp-b2071.appspot.com',
    messagingSenderId: '48980747565',
    appId: '1:48980747565:web:0758afc5c343232f45dfa4'
  })
}

export const auth = getAuth(app)
auth.useDeviceLanguage()

const twitterProvider = new TwitterAuthProvider()

export async function signInWithTwitter() {
  return signInWithPopup(auth, twitterProvider)
}

export function signOut() {
  return auth.signOut()
}

export async function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe()
        if (user) {
          resolve(user)
        } else {
          resolve(null)
        }
      },
      (error) => {
        unsubscribe()
        reject(error)
      }
    )
  })
}
