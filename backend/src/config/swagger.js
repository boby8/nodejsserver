const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Cards API",
    version: "1.0.0",
    description: "A RESTful API for managing cards with authentication",
  },
  servers: [{ url: "http://localhost:4000", description: "Development" }],
  tags: [
    { name: "Authentication", description: "Auth endpoints" },
    { name: "Cards", description: "Card CRUD" },
  ],
  paths: {
    "/auth/signup": {
      post: {
        tags: ["Authentication"],
        summary: "Create account",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/SignupRequest" } },
          },
        },
        responses: {
          201: { description: "User created" },
          409: { description: "User exists" },
          400: { description: "Validation error" },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } },
          },
        },
        responses: {
          200: { description: "Login success" },
          401: { description: "Invalid credentials" },
          403: { description: "Email not verified" },
        },
      },
    },
    "/auth/verify-email": {
      post: {
        tags: ["Authentication"],
        summary: "Verify email",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["token"],
                properties: { token: { type: "string" } },
              },
            },
          },
        },
        responses: { 200: { description: "Verified" }, 400: { description: "Invalid token" } },
      },
    },
    "/auth/forgot-password": {
      post: {
        tags: ["Authentication"],
        summary: "Request password reset",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: { email: { type: "string", format: "email" } },
              },
            },
          },
        },
        responses: { 200: { description: "Reset email sent" } },
      },
    },
    "/auth/reset-password": {
      post: {
        tags: ["Authentication"],
        summary: "Reset password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["token", "password"],
                properties: {
                  token: { type: "string" },
                  password: { type: "string", minLength: 6 },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Password reset" }, 400: { description: "Invalid token" } },
      },
    },
    "/cards/list": {
      get: {
        tags: ["Cards"],
        summary: "Get card list",
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", default: 1 } },
          { in: "query", name: "limit", schema: { type: "integer", default: 10 } },
        ],
        responses: { 200: { description: "Cards with pagination" } },
      },
    },
    "/cards/get/{id}": {
      get: {
        tags: ["Cards"],
        summary: "Get card by ID",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Card", content: { "application/json": { schema: { $ref: "#/components/schemas/Card" } } } },
          404: { description: "Not found" },
        },
      },
    },
    "/cards/persist": {
      post: {
        tags: ["Cards"],
        summary: "Persist (create) card",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title"],
                properties: { title: { type: "string" }, description: { type: "string" } },
              },
            },
          },
        },
        responses: {
          201: { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/Card" } } } },
          400: { description: "Validation error" },
        },
      },
    },
    "/cards/update": {
      put: {
        tags: ["Cards"],
        summary: "Update card",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["id"],
                properties: {
                  id: { type: "integer" },
                  title: { type: "string" },
                  description: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Updated", content: { "application/json": { schema: { $ref: "#/components/schemas/Card" } } } },
          400: { description: "Id required" },
          404: { description: "Not found" },
        },
      },
    },
    "/cards/delete": {
      delete: {
        tags: ["Cards"],
        summary: "Delete card",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["id"],
                properties: { id: { type: "integer" } },
              },
            },
          },
        },
        responses: { 204: { description: "Deleted" }, 400: { description: "Id required" }, 404: { description: "Not found" } },
      },
    },
  },
  components: {
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "integer" },
          email: { type: "string", format: "email" },
          created_at: { type: "string", format: "date-time" },
          email_verified: { type: "boolean" },
        },
      },
      Card: {
        type: "object",
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          description: { type: "string" },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },
      SignupRequest: {
        type: "object",
        required: ["email", "password"],
        properties: { email: { type: "string", format: "email" }, password: { type: "string", minLength: 6 } },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: { email: { type: "string", format: "email" }, password: { type: "string" } },
      },
      LoginResponse: {
        type: "object",
        properties: { token: { type: "string" }, user: { $ref: "#/components/schemas/User" } },
      },
      Error: {
        type: "object",
        properties: { error: { type: "string" } },
      },
    },
  },
};

export { swaggerSpec };
