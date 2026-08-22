# ReachInbox Email Scheduler

A full-stack email scheduling and outreach management application built with React, TypeScript, Node.js, Express, PostgreSQL, Prisma, Redis, and BullMQ.

## Features

- Google Sign-In authentication with server-side ID-token verification
- HTTP-only session cookie authentication
- User/account/profile management
- Create and schedule email campaigns
- Multiple recipients per campaign
- Configurable start time, delivery delay, and hourly limit
- PostgreSQL persistence through Prisma
- Redis-backed distributed scheduling
- BullMQ delayed background jobs
- Scheduled, processing, sent, and failed email states
- Campaign, scheduled, sent, activity, settings, and dashboard views
- Light/dark theme support
- Custom profile avatar selection
- Responsive React UI

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- React Router
- Axios
- Tailwind CSS
- Lucide React
- `@react-oauth/google`

### Backend
- Node.js
- TypeScript
- Express
- Helmet
- CORS
- Cookie Parser
- Google Auth Library
- JSON Web Tokens
- Nodemailer

### Infrastructure
- PostgreSQL
- Prisma ORM
- Redis
- BullMQ
- Docker / Docker Compose

## Architecture

```text
Google OAuth
     |
     v
React Frontend
     |
     | HTTP + session cookie
     v
Express API
     |
     +---- Authentication ---> PostgreSQL
     |
     +---- Campaign API ------> PostgreSQL
     |
     +---- Scheduling --------> Redis / BullMQ
                                      |
                                      v
                                Email Worker
                                      |
                                      v
                                  SMTP Sender
```

## Project Structure

```text
reachinbox-email-scheduler/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── queues/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
└── README.md
```

## Authentication Flow

```text
Google Sign-In
      |
      v
POST /api/auth/google
      |
      v
Verify Google ID token
      |
      v
Create/update User in PostgreSQL
      |
      v
Create JWT session
      |
      v
HTTP-only reachinbox_session cookie
      |
      v
Protected API requests
      |
      v
requireAuth -> req.userId
```

The frontend Axios client uses `withCredentials: true`, allowing the session cookie to be sent with API requests.

## API Endpoints

### Authentication

```http
POST /api/auth/google
GET  /api/auth/me
POST /api/auth/logout
```

### Email / Campaigns

```http
POST /api/emails/schedule
GET  /api/emails/campaigns
GET  /api/emails/scheduled
GET  /api/emails/sent
```

### Health

```http
GET /health
```

Example:

```json
{
  "status": "ok",
  "service": "reachinbox-backend"
}
```

## Campaign Scheduling

When a campaign is created:

```text
Campaign request
      |
      v
Validate request
      |
      v
Apply minimum delay and hourly limits
      |
      v
Reserve delivery slots through Redis
      |
      v
Create Campaign + Email records in PostgreSQL
      |
      v
Create delayed BullMQ jobs
      |
      v
Redis
      |
      v
Email Worker
      |
      v
SMTP delivery
      |
      v
Update Email status
```

System-wide limits prevent campaigns from exceeding the configured maximum sending rate.

## Database

The Prisma schema currently contains:

### User
- `id`
- `googleId`
- `name`
- `email`
- `avatarUrl`
- `createdAt`
- `updatedAt`

### Campaign
- `id`
- `userId`
- `subject`
- `body`
- `startTime`
- `delayMs`
- `hourlyLimit`
- `createdAt`
- `updatedAt`

### Email
- `id`
- `campaignId`
- `senderId`
- `recipient`
- `subject`
- `body`
- `scheduledAt`
- `sentAt`
- `status`
- `attempts`
- `bullJobId`
- `messageId`
- `previewUrl`
- `errorMessage`
- `createdAt`
- `updatedAt`

Email statuses:

```text
SCHEDULED
PROCESSING
SENT
FAILED
```

## Environment Variables

### Backend

Create `backend/.env`:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/reachinbox

REDIS_HOST=localhost
REDIS_PORT=6379

FRONTEND_URL=http://localhost:5173

GOOGLE_CLIENT_ID=your_google_client_id
JWT_SECRET=your_long_random_secret

WORKER_CONCURRENCY=10
MIN_EMAIL_DELAY_MS=2000
MAX_EMAILS_PER_HOUR=200
```

### Frontend

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Never commit secrets to Git.

## Google Cloud Setup

Create/configure a Google OAuth client in Google Cloud Console.

For local development, the frontend origin should include:

```text
http://localhost:5173
```

The same client ID is used by the backend as the expected Google token audience.

## Running Locally

### 1. Start infrastructure

From the project root:

```powershell
docker compose up -d
```

### 2. Start backend

```powershell
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Backend:

```text
http://localhost:5000
```

### 3. Start worker

In another terminal:

```powershell
cd backend
npm run worker
```

### 4. Start frontend

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## Development Checklist

### Authentication
- Open the frontend
- Continue with Google
- Confirm the dashboard loads
- Open the profile menu
- Confirm the authenticated user is displayed

### Campaigns
- Open Campaigns
- Create a campaign
- Add recipients
- Set the start time
- Configure delay and hourly limit
- Submit
- Confirm the campaign appears in the Campaigns page

### Scheduling
- Confirm the campaign appears in Scheduled
- Keep the email worker running
- Wait until the scheduled time
- Confirm the worker processes the job
- Confirm the email status changes
- Confirm completed deliveries appear in Sent

## Useful Debugging Commands

### Backend health

```powershell
Invoke-RestMethod http://localhost:5000/health
```

### Campaigns

```powershell
docker exec reachinbox-postgres psql -U postgres -d reachinbox -c 'SELECT * FROM "Campaign" ORDER BY "createdAt" DESC;'
```

### Emails

```powershell
docker exec reachinbox-postgres psql -U postgres -d reachinbox -c 'SELECT "id", "campaignId", "recipient", "subject", "status", "scheduledAt", "sentAt" FROM "Email" ORDER BY "createdAt" DESC;'
```

### Users

```powershell
docker exec reachinbox-postgres psql -U postgres -d reachinbox -c 'SELECT "id", "googleId", "name", "email" FROM "User";'
```

### Containers

```powershell
docker ps
```

## Build

### Backend

```powershell
cd backend
npm run build
```

### Frontend

```powershell
cd frontend
npm run build
```

## Security

- Google ID tokens are verified server-side.
- Sessions use HTTP-only cookies.
- Protected routes derive the user ID from the authenticated session.
- Campaign queries are scoped to the authenticated user.
- CORS credentials are enabled for the frontend/backend relationship.
- Helmet is enabled.
- Secrets belong in environment variables.
- OAuth credentials and JWT secrets must not be committed.

## Current Project Status

Implemented and integrated:

- Google authentication
- Session-based authorization
- PostgreSQL + Prisma
- Redis scheduling
- BullMQ background jobs
- Email scheduling API
- Campaign API
- Scheduled email API
- Sent email API
- Dashboard
- Campaign management UI
- Light/dark themes
- Account/profile functionality
- Frontend/backend integration

The scheduling system is currently being validated with future-time delivery tests.

## Future Improvements

Potential next steps:

- Campaign detail/edit/delete
- CSV recipient upload
- Rich-text email editor
- Email templates
- Open/click/reply tracking
- Delivery analytics
- Retry controls
- Multiple sender accounts
- Gmail API integration for production sending
- Pagination
- Automated unit/integration tests
- CI/CD
- Production deployment
- Monitoring and structured logging

## License

This project is currently intended for development and demonstration purposes. Add an appropriate open-source license before public distribution.
