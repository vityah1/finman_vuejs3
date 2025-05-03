module.exports = {
  finman: {
    input: {
      target: 'http://localhost:8090/api/v3/api-docs',
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
        mutator: {
          path: './src/api/mutator/custom-instance.ts',
          name: 'customInstance',
        },
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