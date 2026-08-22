# ReachInbox Email Scheduler

A full-stack email scheduling and outreach management application built with React, TypeScript, Node.js, Express, PostgreSQL, Prisma, Redis, and BullMQ.

The application supports Google authentication, campaign creation, persistent email scheduling, Redis-backed rate limiting, BullMQ delayed jobs, background email processing, retry handling, and idempotent delivery.
[ReachInbox Live Link](https://reach-inbox-email-scheduler-jade.vercel.app/)

## Features

### Backend
- Google Sign-In with server-side Google ID-token verification
- HTTP-only JWT session cookie authentication
- User and account management
- Campaign creation and persistence
- Multiple recipients per campaign
- Configurable campaign start time, minimum delivery delay, and hourly limit
- PostgreSQL persistence using Prisma
- Redis-backed distributed scheduling
- BullMQ delayed jobs and background worker
- Worker concurrency control
- Exponential-backoff retries
- Idempotent email processing
- Scheduled / Processing / Sent / Failed states
- Campaign, scheduled-email, and sent-email APIs
- Helmet and CORS

### Frontend
- Google Sign-In
- Dashboard
- Campaign creation and management
- Scheduled and Sent email tables
- Activity view
- Account/profile and Settings
- Custom profile avatar
- Light/dark theme
- Responsive React UI

## Tech Stack

**Frontend:** React, TypeScript, Vite, React Router, Axios, Tailwind CSS, Lucide React, `@react-oauth/google`

**Backend:** Node.js, TypeScript, Express, Helmet, CORS, Cookie Parser, Google Auth Library, JSON Web Tokens, Nodemailer

**Infrastructure:** PostgreSQL, Prisma, Redis, BullMQ, Docker/Docker Compose, Ethereal Email

## Architecture

```text
Google OAuth
     |
React Frontend
     |
HTTP + session cookie
     |
Express API
  |       |        |
  v       v        v
Auth   Campaign  Scheduler
  |       |        |
  +-------+        v
 PostgreSQL       Redis
                    |
                    v
               BullMQ Queue
                    |
                    v
               Email Worker
                    |
                    v
               Ethereal SMTP
```

## Scheduling Without Cron

The application does **not** use OS cron, `node-cron`, `agenda`, or polling timers.

Scheduling uses:
- Redis
- Redis Lua scripting for atomic slot reservation
- BullMQ delayed jobs

Each email is persisted with a `scheduledAt` timestamp and then added to BullMQ with a delay based on that timestamp.

```ts
await emailQueue.add(
  `email-${email.id}`,
  { emailId: email.id },
  {
    jobId: email.id,
    delay: Math.max(
      0,
      email.scheduledAt.getTime() - Date.now()
    ),
  }
);
```

## Persistence and Restart Handling

Scheduling does not depend on in-memory Node.js timers.

- PostgreSQL persists campaigns and individual email `scheduledAt` values.
- Redis/BullMQ persists delayed jobs.
- Restarting the API or worker does not recreate campaigns from the beginning.
- Existing future jobs remain available to the worker after restart.

## Rate Limiting

Defaults:

```text
MIN_EMAIL_DELAY_MS = 2000
MAX_EMAILS_PER_HOUR = 200
```

The scheduler applies:

```text
effectiveHourlyLimit = min(requestedLimit, systemMaximum)
effectiveDelay = max(requestedDelay, systemMinimum)
```

Redis atomically reserves delivery slots and maintains hourly counters.

### 1,000 Email Validation

A 1,000-recipient scheduling test was completed with a 200/hour limit and 2-second minimum delay:

```text
20:00–21:00    200
21:00–22:00    200
22:00–23:00    200
23:00–00:00    200
00:00–01:00    200
--------------------
Total        1,000
```

No hourly bucket exceeded 200 emails.

The test created:
- 1,000 PostgreSQL email records
- 1,000 `SCHEDULED` records
- 1,000 BullMQ delayed jobs

Scheduling completed in approximately 2.4 seconds.

## Worker Concurrency, Retry and Idempotency

Default worker concurrency:

```env
WORKER_CONCURRENCY=10
```

BullMQ jobs use:
- 3 attempts
- Exponential backoff
- 5-second initial backoff

The worker checks the persisted email status before processing. If an email is already `SENT`, it is skipped. Each email uses its database ID as the BullMQ `jobId`.

A stable application-level Message-ID is also generated.

## Ethereal Email

The current implementation uses Ethereal Email through Nodemailer for development/testing.

The application dynamically creates a temporary Ethereal test account with:

```ts
nodemailer.createTestAccount()
```

Therefore, separate Ethereal SMTP credentials are not required in the current implementation.

Successful sends produce an Ethereal preview URL in the worker logs.

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

Never commit actual secrets.

## Google Cloud Setup

1. Create/configure a Google Cloud project.
2. Create a Web Application OAuth client.
3. Add `http://localhost:5173` as an allowed frontend origin.
4. Put the same client ID in both backend and frontend environment files.
5. The backend verifies the Google ID token and checks the configured client ID as its audience.

## Running Locally

### 1. Start PostgreSQL and Redis

From the project root:

```powershell
docker compose up -d
docker ps
```

### 2. Backend

```powershell
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Backend: `http://localhost:5000`

Health: `http://localhost:5000/health`

### 3. BullMQ Worker

In another terminal:

```powershell
cd backend
npm run worker
```

### 4. Frontend

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## API Endpoints

### Authentication

```http
POST /api/auth/google
GET  /api/auth/me
POST /api/auth/logout
```

### Campaigns / Emails

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

## Database Models

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
- `messageId`
- `previewUrl`
- `errorMessage`
- `createdAt`
- `updatedAt`

Statuses:

```text
SCHEDULED
PROCESSING
SENT
FAILED
```

## Demo / Validation

The demonstration should cover:
1. Google login
2. Dashboard
3. Creating a scheduled campaign
4. Scheduled email view
5. Starting the worker
6. Email processing
7. Sent email view
8. Restarting backend/worker
9. Confirming future jobs continue processing
10. Briefly demonstrating rate limiting/delay behavior

## Assumptions and Trade-offs

### Ethereal SMTP
Ethereal is used for development/testing rather than production delivery. The application dynamically creates a test account.

### No Cron
BullMQ delayed jobs and Redis-based slot reservation are used instead of cron.

### Rate Limiting
A system-wide maximum hourly limit and minimum delay prevent campaigns from bypassing global delivery constraints.

### Persistence
PostgreSQL stores campaign/email scheduling state while Redis/BullMQ stores delayed background jobs.

### Production Email
A production deployment would normally use a verified transactional provider such as Amazon SES, SendGrid, or another SMTP/API provider.

### Exactly-once Delivery
Application-level idempotency prevents a completed email from being processed again. Absolute exactly-once external SMTP delivery cannot be guaranteed in every network-failure scenario.

## Security

- Google ID tokens are verified server-side.
- Authentication uses HTTP-only cookies.
- Protected routes derive the user ID from the authenticated session.
- Campaign/email queries are scoped to the authenticated user.
- Helmet is enabled.
- CORS is configured.
- Secrets are stored in environment variables.
- `.env` files are excluded from Git.

## Build

Backend:

```powershell
cd backend
npm run build
```

Frontend:

```powershell
cd frontend
npm run build
```

## Useful Debugging Commands

```powershell
Invoke-RestMethod http://localhost:5000/health

docker ps
```

Campaigns:

```powershell
docker exec reachinbox-postgres psql -U postgres -d reachinbox -c 'SELECT * FROM "Campaign" ORDER BY "createdAt" DESC;'
```

Emails:

```powershell
docker exec reachinbox-postgres psql -U postgres -d reachinbox -c 'SELECT "id", "campaignId", "recipient", "subject", "status", "scheduledAt", "sentAt" FROM "Email" ORDER BY "createdAt" DESC;'
```

Users:

```powershell
docker exec reachinbox-postgres psql -U postgres -d reachinbox -c 'SELECT "id", "googleId", "name", "email" FROM "User";'
```

## Future Improvements

- CSV recipient upload
- Campaign editing/deletion
- Rich-text email editor
- Email templates
- Open/click/reply tracking
- Delivery analytics
- Multiple sender accounts
- Production transactional email provider
- Pagination
- Automated unit/integration tests
- CI/CD
- Monitoring and structured logging
- Production deployment

## License

This project is currently intended for development and demonstration purposes.
