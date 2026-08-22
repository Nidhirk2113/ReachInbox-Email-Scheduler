# ReachInbox Email Scheduler

A full-stack email scheduling and outreach management application built with React, TypeScript, Node.js, Express, PostgreSQL, Prisma, Redis, BullMQ, and Resend.

The application supports Google authentication, campaign creation, persistent email scheduling, Redis-backed rate limiting, BullMQ delayed jobs, background email processing, retry handling, and idempotent delivery.

## Live Demo

**Frontend:** https://reach-inbox-email-scheduler-jade.vercel.app/

**Backend API:** https://optimistic-laughter-production-7fc7.up.railway.app/

## Features

### Authentication
- Google Sign-In
- Server-side Google ID-token verification
- HTTP-only JWT session cookie authentication
- User and account management
- Protected API routes
- User-scoped campaign and email access

### Campaign Management
- Campaign creation
- Multiple recipients per campaign
- Configurable campaign start time
- Configurable minimum delivery delay
- Configurable hourly email limit
- Persistent campaign and email records
- Scheduled, Processing, Sent, and Failed states

### Scheduling & Background Processing
- Redis-backed distributed scheduling
- BullMQ delayed jobs
- Dedicated background email worker
- Configurable worker concurrency
- Exponential-backoff retries
- Idempotent email processing
- Persistent scheduling state
- Restart-safe background processing

### Email Delivery
- Resend API integration
- HTTPS-based email delivery
- Application-level Message-ID support
- Email delivery status tracking
- Resend message ID persistence/logging

### Frontend
- Google Sign-In
- Dashboard
- Campaign creation and management
- Scheduled email table
- Sent email table
- Activity view
- Account/profile settings
- Custom profile avatar
- Light/dark theme
- Responsive React UI

## Tech Stack

**Frontend:** React, TypeScript, Vite, React Router, Axios, Tailwind CSS, Lucide React, `@react-oauth/google`

**Backend:** Node.js, TypeScript, Express, Helmet, CORS, Cookie Parser, Google Auth Library, JSON Web Tokens, Prisma

**Email:** Resend API

**Infrastructure:** PostgreSQL, Redis, BullMQ, Docker/Docker Compose

**Deployment:** Vercel, Railway

## Architecture

```text
Google OAuth
     |
     v
Vercel Frontend
     |
 HTTPS / API
     |
     v
Railway API
     |
     +------------+-------------+
     |                          |
     v                          v
PostgreSQL                    Redis
  Prisma                     BullMQ
                                |
                                v
                         Railway Worker
                                |
                              HTTPS
                                |
                                v
                           Resend API
                                |
                                v
                          Email Recipient
```

### Scheduling Flow

```text
User creates campaign
        |
        v
Express API
        |
        +----> PostgreSQL
        |       Campaign + Email records
        |
        +----> Redis
                Atomic slot reservation
                       |
                       v
                 BullMQ delayed job
                       |
                       v
                 Email Worker
                       |
                       v
                  Resend API
                       |
                       v
                 Email delivery
```

## Scheduling Without Cron

The application does **not** use OS cron, `node-cron`, `agenda`, or polling timers.

Scheduling uses Redis, Redis Lua scripting for atomic slot reservation, BullMQ delayed jobs, and PostgreSQL persistence.

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

- PostgreSQL persists campaigns and individual email `scheduledAt` values.
- Redis/BullMQ persists delayed jobs.
- Restarting the API or worker does not recreate campaigns from the beginning.
- Existing future jobs remain available to the worker after restart.
- Email status is persisted in PostgreSQL.

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

A 1,000-recipient scheduling test was completed with a 200/hour limit and 2-second minimum delay.

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

The test created 1,000 PostgreSQL email records, 1,000 `SCHEDULED` records, and 1,000 BullMQ delayed jobs. Scheduling completed in approximately 2.4 seconds.

## Worker Concurrency, Retry and Idempotency

Default worker concurrency:

```env
WORKER_CONCURRENCY=10
```

BullMQ jobs use 3 attempts, exponential backoff, and a 5-second initial backoff.

The worker checks the persisted email status before processing. If an email is already `SENT`, it is skipped. Each email uses its database ID as the BullMQ `jobId`.

A stable application-level Message-ID is also generated.

## Email Delivery with Resend

The production worker uses the **Resend API** for email delivery. The worker communicates with Resend over HTTPS instead of directly connecting to an SMTP server.

### Resend Testing Mode

The current demonstration deployment uses Resend's testing sender:

```text
onboarding@resend.dev
```

Resend's testing environment restricts recipients to the account's own email address until a sending domain is verified.

Therefore:
- Sending to the configured account email: **Supported**
- Sending to arbitrary external recipients: **Requires a verified Resend domain**

For production use, configure a verified sending domain and change the `from` address to an address on that domain.

## Environment Variables

### Backend

Create `backend/.env`:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/reachinbox

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=

FRONTEND_URL=http://localhost:5173

GOOGLE_CLIENT_ID=your_google_client_id
JWT_SECRET=your_long_random_secret

RESEND_API_KEY=your_resend_api_key

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
3. Add the frontend URL as an authorized JavaScript origin.
4. Put the same client ID in both backend and frontend environment variables.
5. The backend verifies the Google ID token and checks the configured client ID as its audience.

## Running Locally

### Start PostgreSQL and Redis

```powershell
docker compose up -d
docker ps
```

### Backend

```powershell
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Backend: `http://localhost:5000`

Health: `http://localhost:5000/health`

### BullMQ Worker

In another terminal:

```powershell
cd backend
npm run worker
```

### Frontend

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`


## Screenshots

### Google Authentication / Login

![ReachInbox Google Authentication](assets/login.png)

The login screen provides Google authentication and introduces the ReachInbox outreach command center.

### Dashboard

![ReachInbox Dashboard](assets/dashboard.png)

The dashboard provides a central view of campaigns, scheduled deliveries, sent emails, delivery performance, and recent activity.

### Create Campaign

![ReachInbox Create Campaign](assets/create-campaign.png)

The campaign composer supports:
- Multiple recipients
- Email subject and message
- Configurable start time
- Hourly sending limit
- Minimum delay between emails
- Campaign scheduling

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

The demonstration can cover:
1. Google login
2. Dashboard
3. Creating a scheduled campaign
4. Scheduled email view
5. BullMQ job creation
6. Worker processing
7. Resend email delivery
8. Sent email view
9. Retry handling
10. Restarting backend/worker
11. Confirming future jobs continue processing
12. Rate limiting and delay behavior

### Deployment Validation

```text
Google Authentication       ✓
PostgreSQL                  ✓
Redis                       ✓
BullMQ                      ✓
Railway API                 ✓
Railway Worker              ✓
Resend API                  ✓
Scheduled email processing  ✓
Actual email delivery       ✓
```

## Assumptions and Trade-offs

### Resend
Resend is used for email delivery through its HTTPS API. The current demonstration deployment uses Resend's testing sender. Arbitrary recipient delivery requires a verified sending domain.

### No Cron
BullMQ delayed jobs and Redis-based slot reservation are used instead of cron or polling timers.

### Rate Limiting
A system-wide maximum hourly limit and minimum delay prevent campaigns from bypassing global delivery constraints.

### Persistence
PostgreSQL stores campaign/email scheduling state while Redis/BullMQ manages delayed background jobs.

### Separate Worker
The email worker runs independently from the API, allowing background email processing to scale independently from API traffic.

### Exactly-once Delivery
Application-level idempotency prevents a completed email from being processed again. Absolute exactly-once external email delivery cannot be guaranteed in every network-failure scenario.

## Security

- Google ID tokens are verified server-side.
- Authentication uses HTTP-only cookies.
- Protected routes derive the user ID from the authenticated session.
- Campaign/email queries are scoped to the authenticated user.
- Helmet is enabled.
- CORS is configured.
- Secrets are stored in environment variables.
- `.env` files are excluded from Git.
- API credentials are never stored in source code.

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
- Verified custom email domain
- Pagination
- Automated unit/integration tests
- CI/CD
- Monitoring and structured logging
- Production-grade observability
- Advanced email delivery analytics
  
## License

This project is currently intended for development and demonstration purposes.
