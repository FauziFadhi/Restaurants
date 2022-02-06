import { config } from 'dotenv'
import { Client } from 'elasticsearch'
config()

export const elasticClient = new Client({
  host: process.env.ELASTIC_HOST,
})