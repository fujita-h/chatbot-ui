import type { NextApiRequest, NextApiResponse } from 'next'
import { CosmosClient, Database, Container } from "@azure/cosmos";
import jwt from 'jsonwebtoken'

const internalSecret = process.env.INTERNAL_SECRET || 'secret'
const endpoint = process.env.COSMOS_ENDPOINT || "";
const key = process.env.COSMOS_KEY;
const database = process.env.COSMOS_DATABASE || "chatbot-db";
const telemetryContainer_chat = "telemetry-chat-v1";
const telemetryContainers = [telemetryContainer_chat]

const cosmosClient = new CosmosClient({ endpoint, key });

cosmosClient.databases.createIfNotExists({ id: database })
  .then(({ database }) => {
    for (const container of telemetryContainers) {
      database.containers.createIfNotExists({ id: container, partitionKey: { paths: ["/upn"] } });
    }
  })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.headers.internal !== internalSecret) {
    return res.status(401).json({ result: false, reason: "No internal secret" });
  }

  const token = req.headers.authorization?.split(' ')[1] || ''

  if (!token) {
    return res.status(401).json({ result: false, reason: "No token" });
  }

  const decoded: any = jwt.decode(token) || {}
  const { upn } = decoded

  if (!upn) {
    return res.status(401).json({ result: false, reason: "No upn" });
  }

  if (req.method === 'POST') {
    const { model, promptToSend, key, messagesToSend, tokenCount } = req.body
    try {
      const container = cosmosClient.database(database).container(telemetryContainer_chat);
      const { statusCode } = await container.items.create({ upn, model, promptToSend, key, messagesToSend, tokenCount })
      res.status(statusCode).send({ statusCode })
    } catch (e) {
      console.error(e)
      res.status(500).send({ statusCode: 500 })
    }
  } else {
    res.status(405).send({ statusCode: 405 })
  }
}