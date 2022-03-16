import { AzureFunction, Context } from "@azure/functions"
import { Ocr } from "../services/ocr"
import { ComputerVisionModels } from "@azure/cognitiveservices-computervision"
import { LanguageStudio } from "../services/languagestudio";
import { FormRec } from "../services/formrec";
import { CosmosDB } from "../services/cosmosdb";

const sleep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const blobTrigger: AzureFunction = async function (context: Context, myBlob: any): Promise<void> {
    try{
        context.log(`Name of source doc : ${context.bindingData.blobTrigger}`)
        if(process.env.OCR_ENDPOINT && process.env.OCR_APIKEY){
            context.log("ocr")
            const ocr : Ocr = new Ocr(process.env.OCR_ENDPOINT, process.env.OCR_APIKEY)
            const ocrResults : ComputerVisionModels.ReadResult[] = await ocr.execute(context, myBlob)
            if(ocrResults){
                const ocrText : string = ocr.toText(context, ocrResults)

                context.log("language studio")
                const studio : LanguageStudio = new LanguageStudio(process.env.LANGUAGE_STUDIO_ENDPOINT, process.env.LANGUAGE_STUDIO_APIKEY)
                const cnerResults = await studio.customNER(context, ocrText, process.env.LANGUAGE_STUDIO_PROJECT)

                const studio2 : LanguageStudio = new LanguageStudio(process.env.LANGUAGE_STUDIO_PREBUILT_ENDPOINT, process.env.LANGUAGE_STUDIO_PREBUILT_APIKEY)
                const nerResults = await studio2.ner(context, ocrText)


                
                //await sleep(3000)

                context.log("form rec")
                const formrec : FormRec = new FormRec(process.env.FORMREC_ENDPOINT, process.env.FORMREC_APIKEY)
                const formRecResults  = await formrec.generalDoc(context, myBlob)


                context.log("ready to save results");
                
                if(nerResults){
                    //await sleep(3000)
                    context.log("cosmosdb")
                    const cosmos = new CosmosDB(process.env.COSMOSDB_CONNECTION_STRING, process.env.COSMOSDB_DB_NAME, process.env.COSMOSDB_CONTAINER_NAME)
                    const data = {
                        "filename" : context.bindingData.blobTrigger,
                        "ner" : nerResults,
                        "cner" : cnerResults,
                        "ocr" : ocrText,
                        "formrec" : formRecResults
                    }
                    const c = await cosmos.create(context, data)
                    context.log("done")
                } else{
                    //await sleep(3000)
                    context.log('no ner model output')
                    throw Error(`no ner model output, something went wrong`)
                } 
                
            } else{
                throw Error(`no ocr output, something went wrong`)
            } 
            
        }
        
    } catch(err){
        context.log(err)
        throw Error(`blob task failed ${err}`)
    }
};

export default blobTrigger;