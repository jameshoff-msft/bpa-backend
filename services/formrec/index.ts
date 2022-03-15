const { DocumentAnalysisClient, AzureKeyCredential } = require("@azure/ai-form-recognizer");
import { Context } from "@azure/functions"


export class FormRec {

    private _client : any

    constructor(endpoint: string, apikey: string) {
        this._client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(apikey));
    }

    public generalDoc = async (context: Context, file: Buffer) => {

        try {
            const poller = await this._client.beginExtractGeneralDocument(file);
            const { keyValuePairs, entities } = await poller.pollUntilDone();

            return { keyValuePairs, entities }
        } catch (err) {
            context.log(err)
        }

        return null
    }

}