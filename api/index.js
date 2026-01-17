// Vercel serverless function adapter for TanStack Start
import { createServer } from '../.output/server/index.mjs'

export default async function handler(req, res) {
  const server = await createServer()
  return server(req, res)
}
