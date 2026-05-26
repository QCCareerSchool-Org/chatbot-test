import fs from 'fs';

import { client } from '../client/openaiclient.mjs';

async function vectorStore() {
  await client.vectorStores.fileBatches.uploadAndPoll(
    'vs_6a0f10bd9c60819181d27ab29297f270',
    { files: [ fs.createReadStream('./faq.md') ] },
  );
  console.log('added to vector store');
}

void vectorStore();
