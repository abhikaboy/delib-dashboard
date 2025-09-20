# Delibs Backend

Lightweight Node.js/Express backend for the Delibs fraternity application system.

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Environment variables are already configured in `.env`

3. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Health Check
- `GET /health` - Check if the server is running

### Applications
- `GET /api/applications` - Get all applications
- `GET /api/applications/:id` - Get application by ID
- `GET /api/applications/search/:query` - Search applications by name

## Example Responses

### Get All Applications
```json
{
  "success": true,
  "count": 25,
  "data": [...]
}
```

### Get Single Application
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "ratings": {...},
    "evaluations": [...]
  }
}
```

## Development

The server uses Node.js `--watch` flag for auto-restart during development.

## Database

- **Database**: fall2025
- **Collection**: applications
- **Connection**: MongoDB Atlas
