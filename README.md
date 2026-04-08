# Chirpy

A backend REST API server for a Twitter-like social media platform.

## Overview

Chirpy is a Go-like REST API built with Node.js, TypeScript, Express, and PostgreSQL. It provides a complete backend for a microblogging platform where users can post "chirps" (short messages), manage their accounts, and authenticate securely.

## Features

- **User Management** - Create accounts, update credentials, premium status (Chirpy Red)
- **Chirp Management** - Create, read, update, and delete chirps (140 char limit)
- **Authentication** - JWT-based auth with access and refresh tokens
- **Profanity Filter** - Automatic filtering of inappropriate words
- **Webhooks** - Integration with external Polka service for premium upgrades
- **Admin Metrics** - Track API usage statistics

## Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Node.js (ES Modules) |
| Language | TypeScript |
| Framework | Express.js |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Password Hashing | Argon2 |
| Authentication | JWT |
| Testing | Vitest |

## Quick Start

### Prerequisites

- Node.js (see `.nvmrc` for version)
- PostgreSQL database

### Setup

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your database credentials

# Generate database migrations
npm run generate

# Run migrations
npm run migrate
```

### Running

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

The server runs at `http://localhost:8080` by default.

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/users` | Create a new user |
| `PUT /api/users` | Update user credentials |
| `POST /api/login` | Login with email/password |
| `POST /api/refresh` | Refresh access token |
| `POST /api/revoke` | Revoke refresh token |
| `GET /api/chirps` | Get all chirps (optional `author_id` filter) |
| `GET /api/chirps/:id` | Get a specific chirp |
| `POST /api/chirps` | Create a new chirp |
| `DELETE /api/chirps/:id` | Delete a chirp (owner only) |
| `POST /api/polka/webhooks` | Handle external upgrade events |
| `GET /admin/metrics` | View API usage metrics |
| `GET /api/healthz` | Health check |

## Project Structure

```
src/
├── api/              # Route handlers
│   ├── auth.ts      # Login, refresh, revoke
│   ├── chirps.ts    # Chirp CRUD
│   ├── users.ts     # User management
│   ├── middleware.ts
│   └── ...
├── db/
│   ├── schema.ts    # Database schema
│   ├── queries/     # Database queries
│   └── migrations/  # SQL migrations
├── auth.ts          # JWT & password utilities
├── config.ts        # Configuration
└── index.ts         # Entry point
```

## Testing

```bash
npm test
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DB_URL` | PostgreSQL connection string |
| `PORT` | Server port (default: 8080) |
| `PLATFORM` | Platform environment (dev/prod) |
| `JWT_SECRET` | Secret for JWT signing |
| `POLKA_KEY` | API key for Polka webhooks |
