import { CosmosClient } from "@azure/cosmos";

export const cosmosReadAll = async (dbName, containerName) => {

    const client = new CosmosClient(process.env.COSMOS_DB_CONNECTION_STRING);

    const database = client.database(dbName);
    const container = database.container(containerName);
    // const out = await container.item(req.query.pid).read()
    const querySpec = {
        query: "SELECT * FROM c",
        parameters: [

        ]
      };
    const items = await container.items.query(querySpec).fetchAll()
    return items.resources
}

export const cosmosReadAllTruncated = async (dbName, containerName) => {

  const client = new CosmosClient(process.env.COSMOS_DB_CONNECTION_STRING);

  const database = client.database(dbName);
  const container = database.container(containerName);
  // const out = await container.item(req.query.pid).read()
  const querySpec = {
      query: `SELECT {"id":c.id, "sourcefilename":c.sourcefilename} FROM c`,
      parameters: [

      ]
    };
  const items = await container.items.query(querySpec).fetchAll()
  return items.resources
}

export const cosmosQueryBySourceId = async (dbName, containerName, id) => {

  const client = new CosmosClient(process.env.COSMOS_DB_CONNECTION_STRING);

  const database = client.database(dbName);
  const container = database.container(containerName);
  // const out = await container.item(req.query.pid).read()
  const querySpec = {
      query: `SELECT {"id":c.id,"sourcefilename":c.sourcefilename,"filename":c.filename, "classification":c.classification, "processed":c.processed} FROM c WHERE c.sourceid = "${id}"`,
      parameters: [

      ]
    };
  const items = await container.items.query(querySpec).fetchAll()
  return items.resources
}