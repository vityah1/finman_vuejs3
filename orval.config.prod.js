module.exports = {
  finman: {
    input: {
      target: 'https://finman.kt.if.ua/openapi.json', // Буде завантажено окремо
    },
    output: {
      mode: 'tags-split',
      target: './src/api',
      schemas: './src/api/model',
      client: 'vue-query',
      mock: false,
      clean: true,
      prettier: true,
      override: {
        query: {
          useQuery: true,
          useMutation: true,
        },
      },
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write',
    },
  },
};
