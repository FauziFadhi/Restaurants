export const ArrayToBulkElasticCreateDTO = <T>(index: string, data: T[]) => {
  const elasticDTO = [];

  data.forEach((datum) => {
    elasticDTO.push(
      {
        index: { _index: index },
      },
      datum,
    );
  });

  return elasticDTO;
};
