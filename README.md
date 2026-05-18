# Cryptrix - URL Shortener Service

A production-ready URL shortening service with analytics, expiration support, and containerized deployment.

## Features

- ✅ Collision-free 6-character short codes
- ✅ Click tracking with IP & user agent logging
- ✅ URL expiration support
- ✅ Real-time analytics
- ✅ RESTful API
- ✅ Production-ready Docker setup
- ✅ PostgreSQL database
- ✅ Health checks & monitoring
- ✅ Comprehensive error handling
- ✅ CORS & security headers

## Quick Start

### Docker Compose (Recommended)

```bash
git clone https://github.com/identikkal/cryptrix.git
cd cryptrix
cp .env.example .env
docker-compose up -d
```

API available at: `http://localhost:3000`

### Local Development

```bash
npm install
cp .env.example .env
npm run dev
```

## API Endpoints

### Create Short URL

```bash
POST /api/urls
Content-Type: application/json

{
  "url": "https://github.com/identikkal/cryptrix",
  "expires_at": "2026-12-31T23:59:59Z"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "short_code": "aB1cD2",
    "short_url": "http://localhost:3000/aB1cD2",
    "original_url": "https://github.com/identikkal/cryptrix",
    "created_at": "2026-05-18T12:00:00Z"
  }
}
```

### Get URL Details

```bash
GET /api/urls/:code
```

### Get URL Statistics

```bash
GET /api/urls/:code/stats
```

### Redirect to Original URL

```bash
GET /:code
```

Automatically records click and redirects to original URL.

### Delete Short URL

```bash
DELETE /api/urls/:code
```

### List All URLs

```bash
GET /api/urls?page=1&limit=50
```

## Environment Variables

```bash
NODE_ENV=production
PORT=3000
DB_HOST=db
DB_PORT=5432
DB_NAME=cryptrix
DB_USER=cryptrix_user
DB_PASSWORD=secure_password_change_me
BASE_URL=http://localhost:3000
```

## Health Check

```bash
curl http://localhost:3000/health
```

## Database Schema

### URLs Table
- `id` - Primary key
- `short_code` - Unique 6-character code
- `original_url` - Full URL being shortened
- `created_at` - Creation timestamp
- `expires_at` - Optional expiration date
- `created_by` - Optional creator identifier
- `click_count` - Total clicks

### Clicks Table
- `id` - Primary key
- `url_id` - Foreign key to urls
- `user_agent` - User's browser info
- `ip_address` - User's IP address
- `clicked_at` - Click timestamp

## Development

```bash
# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Start production server
npm start
```

## Docker Commands

```bash
# Build image
docker build -t cryptrix:latest .

# Run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

## License

MIT
