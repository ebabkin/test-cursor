import { createSwaggerSpec } from 'next-swagger-doc';

export default function handler(req, res) {
  const spec = createSwaggerSpec({
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Chat Application API',
        version: '1.0.0',
        description: 'API documentation for the Chat Application',
      },
    },
    apiFolder: 'src/pages/api',
  });
  res.json(spec);
} 