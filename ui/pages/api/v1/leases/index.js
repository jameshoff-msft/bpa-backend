import { CosmosClient } from "@azure/cosmos";

export const cosmosReadAllDocuments = async (dbName, containerName) => {

    const client = new CosmosClient(process.env.COSMOS_DB_CONNECTION_STRING);

    const database = client.database(dbName);
    const container = database.container(containerName);
    const querySpec = {
        query: "SELECT * FROM c",
        parameters: [

        ]
      };
    const items = await container.items.query(querySpec).fetchAll()
    return items.resources
}

export default async function handler(req, res) {
    const value = await cosmosReadAllDocuments(process.env.COSMOS_DB_DB,process.env.COSMOS_DB_CONTAINER)
    res.status(200).json(value)
}


