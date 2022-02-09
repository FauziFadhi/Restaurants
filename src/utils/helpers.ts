import { GetResponse, SearchResponse } from 'elasticsearch';

export const ArrayToBulkElasticCreateDTO = <T = any>(
  index: string,
  data: T[],
) => {
  const elasticDTO = [];

  data.forEach((datum: any) => {
    elasticDTO.push(
      {
        index: { _index: index, ...(Boolean(datum?.id) && { _id: datum?.id }) },
      },
      datum,
    );
  });

  return elasticDTO;
};

export function elasticDocToObj<T>(data: GetResponse<T>): T & { id: string };
export function elasticDocToObj<T>(
  data: Pick<SearchResponse<T>, 'hits'>,
  groupBy?: string[],
): (T & { id: string })[];
export function elasticDocToObj(...data: any[]) {
  const datum = data[0];
  if ('_id' in datum) {
    return {
      id: datum._id,
      ...datum._source,
    };
  }

  if (data[1].length >= 2 && typeof data[1][0] == 'string') {
    const result = {};

    data[1].forEach((index) => {
      result[`${index}`] = [];
    });
    datum.hits.hits.forEach((obj) => {
      result[`${obj._index}`]?.push({
        id: obj._id,
        ...obj._source,
      });
    });
    return result;
  }

  return datum.hits.hits.map((obj) => {
    return {
      id: obj._id,
      ...obj._source,
    };
  });
}
