# SkillSync AI Backend

Production-ready backend API for **SkillSync AI**, an AI-powered learning management platform for students, instructors, and administrators.

## Project Overview

SkillSync AI helps learners discover courses, follow structured learning paths, submit assignments, receive instructor feedback, review courses, ask for support, and use AI-assisted learning tools. The backend is built as a modular Express API with strict TypeScript, Prisma ORM, PostgreSQL, JWT authentication, role-based authorization, and AI provider integration.

## Problem Solved

Many learning platforms separate course content, progress tracking, instructor review, support, and AI guidance. SkillSync AI brings these workflows into one backend system with clean permissions, structured data, and production-oriented API patterns.

## Tech Stack

- Node.js, Express.js, TypeScript, ESM
- Prisma ORM, PostgreSQL
- JWT authentication with refresh tokens
- Better Auth-ready future OAuth architecture
- Zod validation
- Pino logging
- Helmet, CORS, cookie-parser, rate limiting
- OpenAI or Gemini provider support

## Core Features

- Auth, users, categories, courses, modules, lessons
- Enrollments, lesson progress, assignments, submissions
- Submission reviews and course reviews
- Blogs and support tickets
- Dashboard analytics
- AI learning tools and AI request logs

## Role-Based Features

- **Student:** enroll in courses, complete lessons, submit assignments, review courses, use AI tools, create support tickets.
- **Instructor:** create/manage own courses, modules, lessons, assignments, review submissions, publish blogs.
- **Admin:** manage users, categories, all courses, all support tickets, platform analytics, AI logs.

## AI Features

- Course summary generator
- Study assistant chat
- Course recommendations
- Assignment feedback
- Blog generator
- Roadmap generator
- Skill gap analyzer
- Project recommender
- Career chat assistant

If no AI key is configured, AI routes return `503` with `AI provider is not configured`. No mock AI content is returned.

## Advanced Backend Engineering

- Strict TypeScript
- Modular controller/service/route/validation structure
- Central error handling
- Standard API response format
- Request validation with Zod
- Prisma relation modeling and transactions
- Role guards and ownership checks
- Pagination, filtering, sorting
- Serverless-ready Vercel entry
- Safe seed script

## Advanced Engineering Concepts Used

- **Domain-driven modular boundaries:** Each major LMS capability is isolated into a module with its own route, controller, service, validation, and interface files.
- **Separation of concerns:** Routing, request validation, business logic, persistence, response formatting, and error handling are kept in separate layers.
- **Role-based access control:** Student, instructor, and admin capabilities are enforced with authentication middleware and role guards.
- **Ownership-based authorization:** Instructors can manage only their own course resources, and students can access only their own enrollments, submissions, progress, and support tickets.
- **Input contract validation:** Zod schemas validate request bodies, route params, query values, enums, UUIDs, and required fields before data reaches services.
- **Operational error modeling:** `AppError` is used for expected business errors while the global error handler normalizes validation, Prisma, JWT, and application failures.
- **Consistent API contracts:** Success, paginated, and error responses follow predictable JSON shapes across modules.
- **Relational data modeling:** Prisma models represent users, courses, modules, lessons, enrollments, assignments, submissions, reviews, support tickets, notifications, and AI logs with relations, indexes, and unique constraints.
- **Transactional consistency:** Multi-step writes such as enrollments, lesson completion, reviews, ratings, and support replies use Prisma transactions where consistency matters.
- **Derived data synchronization:** Course fields such as total lessons, total enrollments, average rating, and total reviews are recalculated or updated when dependent records change.
- **Pagination and query safety:** List endpoints use shared pagination utilities and allow controlled filtering/sorting fields.
- **Secure credential handling:** Passwords are hashed with bcrypt and password fields are excluded from normal API responses.
- **JWT session architecture:** Access and refresh token flows support authenticated API access while keeping Better Auth prepared for future OAuth work.
- **Email OTP workflow:** Email verification and password reset use short-lived OTP records stored through the verification model.
- **Rate limiting strategy:** General, auth, and AI routes have separate request limits to reduce abuse risk.
- **Security middleware pipeline:** Helmet, CORS, JSON body limits, cookie parsing, and protected static uploads are configured at the Express app layer.
- **AI provider abstraction:** OpenAI and Gemini integrations are separated behind service functions and can return structured JSON for product workflows.
- **AI observability:** AI requests are logged with feature type, prompt, response, status, error, user, and timestamp for admin review.
- **Graceful shutdown:** The server handles `SIGTERM` and `SIGINT` and disconnects Prisma before process exit.
- **Environment-driven configuration:** Runtime behavior depends on `.env` values for database, JWT, OAuth, SMTP, AI providers, and deployment URLs.
- **Seeded demo environment:** The Prisma seed script creates realistic demo users, courses, lessons, assignments, reviews, support tickets, notifications, and AI logs for local testing.
- **Build-time verification:** TypeScript compilation and `tsup` build scripts provide a basic release readiness check.

## Differentiating Engineering Concepts

These concepts make SkillSync AI stronger than a normal CRUD backend:

- **Multi-tenant-style ownership boundaries:** Instructor-owned course resources and student-owned learning records are protected at the service layer, not only by route roles.
- **AI workflow observability:** AI usage is stored as structured request logs with feature type, status, prompt, response, error, and user context for admin monitoring.
- **Derived learning analytics:** Course ratings, review counts, enrollment totals, lesson totals, and progress percentages are synchronized from related domain activity.
- **Provider-ready AI architecture:** OpenAI and Gemini are separated behind provider services, allowing the platform to switch or extend AI providers without rewriting route logic.
- **Transactional domain operations:** Important workflows such as enrollment, lesson completion, review creation, rating recalculation, and support replies use transactions to keep related data consistent.
- **Production-style access design:** The system combines JWT authentication, RBAC, ownership checks, Zod validation, rate limiting, and centralized error handling instead of relying on a single security layer.

## Advanced Concepts Implementation Map

| Concept | Where it appears |
| --- | --- |
| Service-layer ownership authorization | Course, module, lesson, assignment, submission, review, enrollment, and support services |
| Transactional consistency | Enrollment creation, lesson completion, course review rating recalculation, submission review, and support replies |
| Derived domain metrics | `totalLessons`, `totalEnrollments`, `averageRating`, `totalReviews`, and enrollment `progress` |
| AI provider abstraction | `ai.service.ts`, `openai.service.ts`, and `gemini.service.ts` |
| AI audit logging | `AiRequestLog` model and admin AI log route |
| Contract-first request validation | Zod schemas in every module validation file |

## Database Summary

Main models include `User`, `Category`, `Course`, `CourseModule`, `Lesson`, `Enrollment`, `LessonProgress`, `Assignment`, `Submission`, `Review`, `CourseReview`, `Blog`, `SupportTicket`, `SupportMessage`, `Notification`, and `AiRequestLog`.

## API Docs

Route JSON files are available in `docs/`:

- `docs/api-routes.json`
- `docs/auth-routes.json`
- `docs/user-routes.json`
- `docs/category-routes.json`
- `docs/course-routes.json`
- `docs/course-module-routes.json`
- `docs/lesson-routes.json`
- `docs/enrollment-routes.json`
- `docs/assignment-routes.json`
- `docs/submission-routes.json`
- `docs/review-routes.json`
- `docs/course-review-routes.json`
- `docs/blog-routes.json`
- `docs/support-routes.json`
- `docs/dashboard-routes.json`
- `docs/ai-routes.json`

Frontend implementation guide:

- `docs/frontend-nextjs-implementation.md`

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://..."
CLIENT_URL="http://localhost:3000"
JWT_ACCESS_SECRET="..."
JWT_REFRESH_SECRET="..."
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="http://localhost:5000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM=""
DEMO_STUDENT_PASSWORD="Student@123"
DEMO_INSTRUCTOR_PASSWORD="Instructor@123"
DEMO_ADMIN_PASSWORD="Admin@123"
OPENAI_API_KEY=""
GEMINI_API_KEY=""
```

## Local Setup

```bash
bun install
bunx prisma generate
bun run dev
```

Health check:

```bash
GET http://localhost:5000/health
```

## Prisma Commands

```bash
bunx prisma migrate dev --name init
bunx prisma generate
bunx prisma studio
```

Production migrations:

```bash
bunx prisma migrate deploy
```

## Seed Command

```bash
bun run prisma:seed
```

or with npm:

```bash
npm run prisma:seed
```

## Demo Credentials

Student:

```text
student@skillsync.ai
DEMO_STUDENT_PASSWORD
```

Instructor:

```text
instructor@skillsync.ai
DEMO_INSTRUCTOR_PASSWORD
```

Admin:

```text
admin@skillsync.ai
DEMO_ADMIN_PASSWORD
```

## Better Auth Note

Authentication is currently JWT-based. Better Auth configuration is prepared for future OAuth/social login integration. Better Auth routes are not mounted yet to avoid conflicts with the current Prisma User model and active JWT flow.

## Deployment Notes

- Set `NODE_ENV=production`.
- Set all required env vars in Vercel.
- Run migrations before using production APIs.
- Use `bunx vercel --prod` for deployment.
- Production health URL: `/health`.

## Manual Testing

Use `TESTING.md` for checklist-based API testing. Use the JSON route files in `docs/` for request bodies and route references.

## Author

Fahim Muntasir  
GitHub: https://github.com/FahimMuntasir0417
