import { SearchResponse } from 'elasticsearch';

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

export function elasticDocToObj<T>(
  data: Pick<SearchResponse<T>, 'hits'>,
): (T & { id: string })[] {
  return data.hits.hits.map((obj) => {
    return {
      id: obj._id,
      ...obj._source,
    };
  });
}
