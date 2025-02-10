# Chat Application Demo

A simple chat application built with Next.js and Material-UI that simulates a WhatsApp-like interface.

## Features

- WhatsApp-style chat interface with:
  - User messages aligned to the right (blue background)
  - System responses aligned to the left (grey background)
  - Auto-scrolling message list
  - Message input with Enter key support
- Real-time message sending and responses
- Material-UI components for modern design
- Fully responsive layout (mobile and desktop)

## Technical Stack

- **Frontend**: 
  - Next.js 14
  - React 18
  - Material-UI (MUI)
  - TypeScript
- **Backend**: 
  - Next.js API routes
  - Server-side message logging
- **Containerization**: 
  - Docker with Node 18 Alpine

## Setup

### Prerequisites
- Node.js (v14 or higher)
- Docker and Docker Compose
- PostgreSQL (if running without Docker)

### Database Setup
1. Start the PostgreSQL database using Docker:
```bash
docker-compose up -d
```

2. Install dependencies:
```bash
npm install
```

3. Run database migrations:
```bash
npm run migrate:up
```

### Environment Variables
Create a `.env.local` file in the root directory with the following variables:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=postgres
```

### Development
1. Start the development server:
```bash
npm run dev
```

2. Access the application:
- Web application: http://localhost:3000
- API documentation: http://localhost:3000/api-docs

### Testing
Run the test suite:
```bash
npm test
```

## API Endpoints

### POST /api/messages

Accepts a message and returns a confirmation with timestamp.

Request body:
```json
{
  "message": "Your message here"
}
```

Response:
```json
{
  "response": "Message accepted, length: 20 at date:20240321 143022 UTC"
}
```

## Implementation Details

- Messages are not persisted (in-memory only)
- System responses include:
  - Message length
  - Timestamp in YYYYMMDD HHMMSS TZ format
- Backend logs all received messages to stdout
- Supports both mouse and keyboard interaction
- Real-time message updates without page refresh

## Development Notes

- The application uses TypeScript for better type safety
- Components are modular and reusable
- MUI theming is configured for light mode by default
- Messages automatically scroll into view when new ones arrive
- Error handling is implemented for failed API calls

## Project Structure

```
.
├── src/
│   ├── components/          # React components
│   │   ├── ChatInterface.tsx
│   │   ├── MessageList.tsx
│   │   └── MessageBubble.tsx
│   ├── pages/              # Next.js pages
│   │   ├── api/           
│   │   │   └── messages.ts # API endpoint
│   │   ├── _app.tsx       
│   │   └── index.tsx      
│   └── types/             
│       └── chat.ts        # TypeScript interfaces
├── Dockerfile             # Docker configuration
├── package.json          
└── README.md
```

## Testing

The project includes several types of tests:

### Unit Tests
Run the unit test suite:
```bash
npm test
```

### End-to-End Tests
The project includes both browser-based and API-level E2E tests.

#### Prerequisites
- Docker and Docker Compose (for test database)
- Node.js 14 or higher

#### Running E2E Tests
1. Run all E2E tests (includes setup and teardown):
```bash
npm run test:e2e:all
```

2. Or run individual test suites:
- Browser tests: `npm run test:e2e --verbose`
- API tests: `npm run test:api --verbose`

3. Manual setup/teardown:
```bash
# Start test database
npm run test:e2e:setup

# Run migrations for test environment
npm run migrate:test

# Stop test database
npm run test:e2e:teardown
```

#### Test Reports
- Browser test reports are available in `e2e/playwright-report/`
- Failed test screenshots in `e2e/test-results/`

## API Documentation

The API documentation is available through Swagger UI. To view it:

1. Start the development server:
```bash
npm run dev
```

2. Open http://localhost:3000/api-docs in your browser

### Updating API Documentation

The API documentation is generated from JSDoc comments in the API route files. To update the documentation:

1. Add or modify the JSDoc comments in the API route files
2. The changes will be automatically reflected in the Swagger UI
3. Make sure to follow the OpenAPI 3.0.0 specification format

## Authentication Configuration

The application uses JWT (JSON Web Tokens) with RS256 algorithm for authentication. This requires a public/private key pair for token signing and verification.

### Generating Keys

1. Generate a private key:
```bash
openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:2048
```

2. Extract the public key:
```bash
openssl rsa -pubout -in private.pem -out public.pem
```

### Environment Configuration

The application expects the following environment variables for JWT authentication:

```env
# Base64 encoded private key for JWT signing
JWT_PRIVATE_KEY=<base64-encoded-private-key>

# Base64 encoded public key for JWT verification
JWT_PUBLIC_KEY=<base64-encoded-public-key>
```

To set these variables:

1. Convert your PEM files to base64:
   ```bash
   # On Unix/Linux/macOS:
   base64 -i private.pem
   base64 -i public.pem

   # On Windows PowerShell:
   [Convert]::ToBase64String([System.IO.File]::ReadAllBytes("private.pem"))
   [Convert]::ToBase64String([System.IO.File]::ReadAllBytes("public.pem"))
   ```

2. Add the base64-encoded keys to your environment files:
   - `.env.local` for local development
   - `.env.test` for testing environment
   - Production environment variables should be configured in your deployment platform

### Security Notes

- Keep your private key secure and never commit it to version control
- Rotate keys periodically for enhanced security
- Use environment-specific keys for different deployments (development, staging, production)