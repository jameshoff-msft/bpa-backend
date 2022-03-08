import { CosmosClient } from "@azure/cosmos"

export class CosmosDB {

    private _connectionString : string
    private _dbName : string
    private _containerName : string

    constructor(connectionString : string, dbName : string, containerName : string) {
        this._connectionString = connectionString
        this._dbName = dbName
        this._containerName = containerName
    }

    public create = async (context, data) : Promise<any> => {
        try {
            context.log(`connection string: ${this._connectionString}`)
            const client = new CosmosClient(this._connectionString);
            context.log(`db: ${this._dbName}`)
            const database = client.database(this._dbName);
            const container = database.container(this._containerName);
            context.log(`container: ${this._containerName}`)
            const { resource: createdItem } = await container.items.create(data);
            context.log(`connection string 2: ${this._connectionString}`)
            return createdItem
        } catch (err) {
            context.log(err)
        }
        return null
    }
}