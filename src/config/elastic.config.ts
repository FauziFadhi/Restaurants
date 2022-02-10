import { config } from 'dotenv';
import { Client } from 'elasticsearch';
import { INDEX_MAPPINGS } from '../migration/elasticsearch';
config();

export const elasticClient = new Client({
  host: process.env.ELASTIC_HOST,
  ssl: { rejectUnauthorized: false, pfx: [] },
});

export const elasticIndexMapping = async () => {
  for (const data of INDEX_MAPPINGS) {
    try {
      await elasticClient.indices.create({
        index: data.index,
        body: (data as any).body,
      });
    } catch (e) {
      console.log(e);
    }
  }

};
