import { DocumentAnalysisClient, AzureKeyCredential } from "@azure/ai-form-recognizer"
import { Context } from "@azure/functions"


export class FormRec {

    private _client : DocumentAnalysisClient

    constructor(endpoint: string, apikey: string) {
        this._client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(apikey));
    }

    public generalDoc = async (context: Context, file: Buffer) => {
        context.log(JSON.stringify(this._client))
        
        try {
            const poller = await this._client.beginExtractGenericDocument(file);
            const { keyValuePairs, entities } = await poller.pollUntilDone();

            return { keyValuePairs, entities }
        } catch (err) {
            context.log(err)
        }

        return null
    }

}