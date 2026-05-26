import { client } from "../client/openaiclient.js";
import fs from "fs";

async function vectorStore() {
    const vector_store_id = 'vs_6a0f10bd9c60819181d27ab29297f270';
    await client.vectorStores.fileBatches.uploadAndPoll(vector_store_id,
    {
        files: [fs.createReadStream("./faq.md")],
    })
    console.log("added to vector store");
}
vectorStore();