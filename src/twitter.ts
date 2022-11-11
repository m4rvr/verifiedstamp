import { TwitterApi } from 'twitter-api-v2'

let twitterClient: TwitterApi

export function getTwitterClient(oauthToken: string, oauthTokenSecret: string) {
  if (twitterClient) {
    return twitterClient
  }

  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_APP_KEY!,
    appSecret: process.env.TWITTER_API_APP_SECRET!,
    accessToken: oauthToken,
    accessSecret: oauthTokenSecret
  })

  twitterClient = client

  return twitterClient
}
