import { createSwaggerSpec } from 'next-swagger-doc';

const apiDocumentation = {
  openapi: '3.0.0',
  info: {
    title: 'Chat Application API',
    version: '1.0.0',
    description: 'API documentation for the Chat Application',
  },
  paths: {
    '/api/users/register': {
      post: {
        summary: 'Register a new user',
        tags: ['Users'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nickname', 'email', 'password'],
                properties: {
                  nickname: {
                    type: 'string',
                    description: 'User nickname',
                  },
                  email: {
                    type: 'string',
                    format: 'email',
                    description: 'User email address',
                  },
                  password: {
                    type: 'string',
                    description: 'User password',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User successfully registered',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      format: 'uuid',
                    },
                    nickname: {
                      type: 'string',
                    },
                    email: {
                      type: 'string',
                    },
                    creation_date: {
                      type: 'string',
                      format: 'date-time',
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid input',
          },
          409: {
            description: 'Email already registered',
          },
          500: {
            description: 'Internal server error',
          },
        },
      },
    },
    '/api/users/authenticate': {
      post: {
        summary: 'Authenticate user',
        tags: ['Users'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                  },
                  password: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Successfully authenticated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      format: 'uuid',
                    },
                    nickname: {
                      type: 'string',
                    },
                    email: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Invalid credentials',
          },
          500: {
            description: 'Internal server error',
          },
        },
      },
    },
    '/api/users/{id}': {
      get: {
        summary: 'Get user by ID',
        tags: ['Users'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
            description: 'User ID',
          },
        ],
        responses: {
          200: {
            description: 'User found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      format: 'uuid',
                    },
                    nickname: {
                      type: 'string',
                    },
                    email: {
                      type: 'string',
                    },
                    creation_date: {
                      type: 'string',
                      format: 'date-time',
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'User not found',
          },
          500: {
            description: 'Internal server error',
          },
        },
      },
    },
  },
};

export default function handler(req, res) {
  const spec = createSwaggerSpec({
    definition: apiDocumentation,
    apiFolder: 'src/pages/api',
  });
  res.json(spec);
} 