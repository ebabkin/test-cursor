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
  "response": "Message accepted, length:20 at date:20240321 143022 UTC"
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

To run tests locally:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

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