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

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Docker (optional, for containerized deployment)

### Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Using Docker

1. Build the Docker image:
```bash
docker build -t chat-app .
```

2. Run the Docker container:
```bash
docker run -p 3000:3000 chat-app
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

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