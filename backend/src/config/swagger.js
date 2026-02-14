import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Todo API",
      version: "1.0.0",
      description: "A RESTful API for managing todos with authentication",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "User ID",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Account creation date",
            },
            email_verified: {
              type: "boolean",
              description: "Whether email is verified",
            },
          },
        },
        Todo: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Todo ID",
            },
            title: {
              type: "string",
              description: "Todo title",
            },
            completed: {
              type: "boolean",
              description: "Whether todo is completed",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Creation date",
            },
            updated_at: {
              type: "string",
              format: "date-time",
              description: "Last update date",
            },
          },
        },
        TodosResponse: {
          type: "object",
          properties: {
            todos: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Todo",
              },
            },
            pagination: {
              type: "object",
              properties: {
                page: {
                  type: "integer",
                },
                limit: {
                  type: "integer",
                },
                total: {
                  type: "integer",
                },
                pages: {
                  type: "integer",
                },
              },
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Error message",
            },
          },
        },
        SignupRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
            },
            password: {
              type: "string",
              minLength: 6,
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
            },
            password: {
              type: "string",
            },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            token: {
              type: "string",
              description: "JWT authentication token",
            },
            user: {
              $ref: "#/components/schemas/User",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
