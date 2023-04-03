import { CosmosClient, Database, Container } from "@azure/cosmos";
import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'


// Endpoint format: https://YOUR-RESOURCE-NAME.documents.azure.com:443/
const endpoint = process.env.COSMOS_ENDPOINT || "";
// Provide required connection from environment variables
const key = process.env.COSMOS_KEY;
const database = process.env.COSMOS_DATABASE || "user-storage";

const simpleKeyValueContainers = [
  "theme", 
  "showChatbar", 
  "showPromptbar",
  "folders", 
  "prompts",
  "selectedConversation", 
  "conversationHistory",
];

const cosmosClient = new CosmosClient({ endpoint, key });

// Init database and container
cosmosClient.databases.createIfNotExists({ id: database })
  .then(({ database }) => {
    for (const container of simpleKeyValueContainers) {
      database.containers.createIfNotExists({ id: container, partitionKey: { paths: ["/id"] } });
    }
  })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.split(' ')[1] || ''
  const decoded: any = jwt.decode(token)

  if (req.method === 'POST') {
    const { upn } = decoded
    const { key } = req.body

    if (simpleKeyValueContainers.includes(key)) {
      try {
        const container = cosmosClient.database(database).container(key);
        const { statusCode, resource } = await container.item(upn, upn).read();
        if (statusCode === 200) {
          res.send({ statusCode, value: resource.value })
        } else if (statusCode === 404) {
          res.status(statusCode).send({ statusCode, error: "not found" })
        } else {
          res.status(statusCode).send({ statusCode })
        }
      } catch (e) {
        res.status(500).send({ statusCode: 500 })
      }
    }
    else {
      res.status(501).send({ statusCode: 501 })
    }

  } else if (req.method === 'PUT') {
    const { upn } = decoded
    const { key, value } = req.body

    if (simpleKeyValueContainers.includes(key)) {
      const container = cosmosClient.database(database).container(key);
      const { statusCode } = await container.items.upsert({ id: upn, value })
      res.status(statusCode).send({ statusCode })
    } else {
      res.status(501).send({ statusCode: 501 })
    }

  } else if (req.method === 'DELETE') {
    const { upn } = decoded
    const { key } = req.body

    if (simpleKeyValueContainers.includes(key)) {
      try {
        const container = cosmosClient.database(database).container(key);
        const { statusCode } = await container.item(upn, upn).delete()
        res.status(statusCode).send({ statusCode })

      } catch (e) {
        res.status(500).send({ statusCode: 500 })
      }
    } else {
      res.status(501).send({ statusCode: 501 })
    }


  } else {
    res.status(405).send({ statusCode: 405 })
  }

}
