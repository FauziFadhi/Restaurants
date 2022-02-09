import { config } from 'dotenv';
import { Client } from 'elasticsearch';
import { INDEX_MAPPINGS } from '../migration/elasticsearch';
config();

export const elasticClient = new Client({
  host: process.env.ELASTIC_HOST,
});

export const elasticIndexMapping = async () => {
  await Promise.all(
    INDEX_MAPPINGS.map(async ({ index, body, type }: any) => {
      try {
        elasticClient.indices.create({
          index,
          body,
        });
      } catch (e) {
        console.log(e);
      }
    }),
  );

  return;
};
