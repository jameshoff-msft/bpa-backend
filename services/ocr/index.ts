import { ComputerVisionClient, ComputerVisionModels } from "@azure/cognitiveservices-computervision"
import { ApiKeyCredentials } from "@azure/ms-rest-js"
import { Context } from "@azure/functions"
import { Readable } from "stream"
import { isContext } from "vm"

export class Ocr {

    private _client: ComputerVisionClient

    constructor(endpoint: string, apikey: string) {
        this._client = new ComputerVisionClient(
            new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': apikey } }), endpoint);
    }

    private sleep = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public execute = async (context: Context, file: Buffer): Promise<ComputerVisionModels.ReadResult[]> => {
        try { 
            let fileStream = await this._client.readInStream(file);
            //Operation ID is last path segment of operationLocation (a URL)
            let operation: string = fileStream.operationLocation.split('/').slice(-1)[0];
            // Wait for read recognition to complete
            // result.status is initially undefined, since it's the result of read
            let status: string = ''
            let result: ComputerVisionModels.GetReadResultResponse = null
            while (status !== 'succeeded') {
                context.log("in ocr read loop")
                result = await this._client.getReadResult(operation);
                status = result.status
                context.log(`ocr status: ${status}`)
                //await this.sleep(1000);
            }
            context.log("completed")
            return result.analyzeResult.readResults;
        } catch (err) {
            context.log(`error in ocr execute ${err}`)
        }
        return null
    }

    public toText = (context : Context, results: ComputerVisionModels.ReadResult[]): string => {
        context.log(`converting ocr output to string`)
        let outString = ""
        for (const page of results) {
            for (const line of page.lines) {
                outString += " " + line.text
            }
        }
        return outString.replace('[A-Za-z0-9 *!$%&()?<>{}]+', '')
    }
}