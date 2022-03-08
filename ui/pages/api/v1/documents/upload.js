import formidable from 'formidable';
const { BlobServiceClient } = require('@azure/storage-blob');
import fs from 'fs'

export const config = {
    api: {
        bodyParser: false,
    },
};

const upload2BlobStorage = async (filename) => {

    // Create the BlobServiceClient object which will be used to create a container client
    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.BLOB_STORAGE_CONNECTION_STRING);
    // Get a reference to a container
    const containerClient = blobServiceClient.getContainerClient(process.env.BLOB_STORAGE_CONTAINER);
    // Get a block blob client
    const filenameSplit = filename.split("/")
    const zipFilename = filenameSplit[filenameSplit.length - 1]
    const blockBlobClient = containerClient.getBlockBlobClient(zipFilename);
    const buf = fs.readFileSync(filename)
    const uploadBlobResponse = await blockBlobClient.upload(buf, buf.length);
    console.log("Blob was uploaded successfully. requestId: ", uploadBlobResponse.requestId);

    return true
}

export default async (req, res) => {
    console.log(`${JSON.stringify(req.file)}`)
    const form = new formidable.IncomingForm();
    form.uploadDir = "./documents";
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        console.log(`err ${err}`)
        console.log(`fields ${JSON.stringify(fields)}`)
        console.log(`files ${JSON.stringify(files)}`)
        fs.rename(files.file.path, form.uploadDir + "/" + files.file.name);
        upload2BlobStorage(form.uploadDir + "/" + files.file.name).then((resolve, reject) => {
            if (resolve) {
                res.json({ status: "success" })
            } else {
                res.json({ status: "failed" })
            }
        }).catch(err => {
            res.json({status : "failed"})
        })
    });
};