import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Cards API",
      version: "1.0.0",
      description: "A RESTful API for managing cards with authentication",
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
        Card: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Card ID",
            },
            title: {
              type: "string",
              description: "Card title",
            },
            description: {
              type: "string",
              description: "Card description",
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
