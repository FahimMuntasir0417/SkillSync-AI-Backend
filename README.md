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
