import axios from "axios"
import { Context } from "@azure/functions"

export class LanguageStudio {

    private _endpoint : string
    private _apikey : string

    constructor(endpoint : string, apikey : string) {
        this._endpoint = endpoint
        this._apikey = apikey
    }

    private sleep = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public customNER = async (context: Context, text : string, projectName : string) => {
        context.log(`entered customNER`)
        try {
            const body = { "tasks": { "customEntityRecognitionTasks": [{ "parameters": { "project-name": projectName, "deployment-name": "prod", "stringIndexType": "TextElement_v8" } }] }, "displayName": "CustomTextPortal_extraction", "analysisInput": { "documents": [{ "id": "document_extraction", "text": text, "language": "en-us" }] } }
            const headers = {
                'Ocp-Apim-Subscription-Key': this._apikey,
                'Content-Type': 'application/json'
            };

            const requestResponse = await axios.post(this._endpoint, body, { headers })

            let status = "not started"
            let retrieveResponse = null
            while (status != "succeeded") {
                context.log("ner loop")
                retrieveResponse = await axios.get(`${requestResponse.headers["operation-location"]}`, { headers })
                context.log(JSON.stringify(retrieveResponse.data))
                //await this.sleep(1000)
                status = retrieveResponse.data.status
                context.log(`ner custom status : ${status}`)
            }
            //await this.sleep(2000)
            context.log(`exited customNER status loop`)
            if (retrieveResponse) {
                //await this.sleep(1000)
                context.log(`returning response`)
                return retrieveResponse.data.tasks.customEntityRecognitionTasks[0].results.documents[0].entities
            } else {
                context.log("no response")
            }
        } catch (err) {
            context.log(err)
            throw Error(err)
        }
        return []
    }


    public ner = async (context: Context, text : string) => {
        context.log(`entered customNER`)
        try {
            const body = {documents:[{language:"en", "id":"1","text":text}] }
            const headers = {
                'Ocp-Apim-Subscription-Key': this._apikey,
                'Content-Type': 'application/json'
            };

            const url = `${this._endpoint}text/analytics/v3.2-preview.2/entities/recognition/general?stringIndexType=TextElement_v8`

            const requestResponse = await axios.post(url, body, { headers })

            let status = "not started"
            let retrieveResponse = null
            while (status != "succeeded") {
                context.log("ner loop")
                retrieveResponse = await axios.get(`${requestResponse.headers["operation-location"]}`, { headers })
                context.log(JSON.stringify(retrieveResponse.data))
                //await this.sleep(1000)
                status = retrieveResponse.data.status
                context.log(`ner custom status : ${status}`)
            }
            //await this.sleep(2000)
            context.log(`exited customNER status loop`)
            if (retrieveResponse) {
                //await this.sleep(1000)
                context.log(`returning response ${retrieveResponse.data}`)
                return retrieveResponse.data
            } else {
                context.log("no response")
            }
        } catch (err) {
            context.log(err)
            throw Error(err)
        }
        return []
    }
}