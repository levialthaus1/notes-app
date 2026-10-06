import { MongoClient } from 'mongodb'
import { env } from './env.js'

const client = new MongoClient(env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
})

export const db = client.db(env.MONGODB_DB)
