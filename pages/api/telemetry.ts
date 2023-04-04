import type { NextApiRequest, NextApiResponse } from 'next'
import { CosmosClient, Database, Container } from "@azure/cosmos";
import jwt from 'jsonwebtoken'
import { Conversation } from '@/types/chat';
import { Tiktoken } from '@dqbd/tiktoken/lite';
import tiktokenModel from '@dqbd/tiktoken/encoders/cl100k_base.json';

const endpoint = process.env.COSMOS_ENDPOINT || "";
const key = process.env.COSMOS_KEY;
const database = process.env.COSMOS_DATABASE || "chatbot-db";
const telemetryContainer_user = "telemetry-user-v1";
const telemetryContainers = [telemetryContainer_user]

const cosmosClient = new CosmosClient({ endpoint, key });

cosmosClient.databases.createIfNotExists({ id: database })
  .then(({ database }) => {
    for (const container of telemetryContainers) {
      database.containers.createIfNotExists({ id: container, partitionKey: { paths: ["/upn"] } });
    }
  })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.split(' ')[1] || ''
  const decoded: any = jwt.decode(token) || {}
  const { upn } = decoded

  if (req.method === 'POST') {
    if (!upn) {
      return res.status(400).json({ result: false, reason: "No upn" });
    }

    try {
      const conversation: Conversation = req.body
      const { id: conversationId, name, model, messages, prompt } = conversation
      let completionTokenCount: number = 0

      const latestCompletionMessages = messages
        .filter((m) => m.role === 'assistant')
        .slice(-1)

      if (latestCompletionMessages.length > 0) {

        const encoder = new Tiktoken(
          tiktokenModel.bpe_ranks,
          tiktokenModel.special_tokens,
          tiktokenModel.pat_str
        );

        const tokens = encoder.encode(latestCompletionMessages[0].content)
        completionTokenCount = tokens.length

        encoder.free();
      }

      const container = cosmosClient.database(database).container(telemetryContainer_user);
      const { statusCode } = await container.items.create({ upn, conversationId, name, model, messages, prompt, completionTokenCount })
      res.status(statusCode).send({ statusCode })
    } catch (e) {
      console.error(e)
      res.status(500).send({ statusCode: 500 })
    }

  } else {
    res.status(405).send({ statusCode: 405 })
  }
}
