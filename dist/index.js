
import OpenAI from "openai";
import fs from "fs";
const client = new OpenAI({
    apiKey: process.env.API_KEY,
});
async function main() {
    const vector_store_id = 'vs_6a0f10bd9c60819181d27ab29297f270';
    await client.vectorStores.fileBatches.uploadAndPoll(vector_store_id, {
        files: [fs.createReadStream("./testfile.pdf")],
    });
    console.log("added to vector store");
}
main();
//# sourceMappingURL=index.js.map