declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly FIREBASE_PROJECT_ID: string
      readonly FIREBASE_ADMIN_PRIVATE_KEY: string
      readonly FIREBASE_ADMIN_CLIENT_EMAIL: string
      readonly TWITTER_API_APP_KEY: string
      readonly TWITTER_API_APP_SECRET: string
    }
  }
}

export {}
