export default {
  taskify: {
    input: './openapi.json',
    output: {
      target: './src/api/api.ts',
      schemas: './src/api/schemas',
      client: 'axios',
    },
  },
};
