# SkillSync AI Backend API

The production-grade backend for **SkillSync AI**, an AI-powered learning management platform that brings courses, progress tracking, instructor workflows, support, notifications, dashboards, and real Gemini AI tools into one secure API.

Built with TypeScript, Express, Prisma, and PostgreSQL, this backend is designed to demonstrate real system thinking: modular domains, role-based access, ownership checks, transactional workflows, structured validation, centralized errors, observability, and practical AI integration.

## AI Feature Spotlight

SkillSync AI includes a real Gemini-powered AI layer, not mocked or hardcoded demo text. The AI module turns learner goals, skills, submissions, and course context into structured, useful outputs that can drive real learning decisions:

- **Roadmap Generator:** creates phased learning plans from goals, current level, and weekly availability.
- **Skill Gap Analyzer:** compares current skills against a target role and returns prioritized gaps.
- **Project Recommender:** suggests portfolio projects based on role, level, and known skills.
- **AI Chat Assistant:** answers learning, roadmap, project, and career questions in a structured assistant workflow.
- **Course Summary:** summarizes course content so learners can understand fit before or during enrollment.
- **Recommendation Engine:** suggests courses based on learner interests and enrollment context.
- **Assignment Feedback:** analyzes submission links and notes to provide improvement feedback.
- **Blog Generator:** helps admins/instructors draft educational content.

AI requests are validated, rate-limited, parsed as structured JSON where appropriate, and logged through AI history/log models for observability. If `GEMINI_API_KEY` is missing, the API returns a clear service configuration error instead of pretending to generate AI output.

## Table of Contents

- [About the Project](#about-the-project)
- [AI Feature Spotlight](#ai-feature-spotlight)
- [Project Overview](#project-overview)
- [Problem Statement](#problem-statement)
- [Solution Overview](#solution-overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Screenshots / GIFs](#screenshots--gifs)
- [Dependencies](#dependencies)
- [Live Demo and Credentials](#live-demo-and-credentials)
- [Installation and Setup](#installation-and-setup)
- [Environment Variables](#environment-variables)
- [API and Architecture](#api-and-architecture)
- [Folder Structure](#folder-structure)
- [Available Scripts](#available-scripts)
- [Notable Workflows](#notable-workflows)
- [Documentation and Reference Files](#documentation-and-reference-files)
- [Deployment Notes](#deployment-notes)
- [Quality Signals](#quality-signals)
- [Contributions](#contributions)
- [How to Contribute](#how-to-contribute)
- [License](#license)
- [Contact](#contact)

## About the Project

SkillSync AI Backend API powers a complete role-based learning platform where students, instructors, and admins work from the same connected system. Students discover courses, enroll, track progress, submit assignments, receive feedback, review courses, ask for support, and use AI tools for planning and improvement.

This repository contains the backend only. The API is organized by domain modules, uses Prisma with PostgreSQL, sends transactional emails with Nodemailer and EJS templates, stores uploaded assets locally, uses JWT authentication, and keeps Better Auth configuration ready for future OAuth expansion.

## Project Overview

SkillSync AI provides the backend system for a production-style learning management platform with AI-assisted learning workflows.

The backend supports:

- Public and authenticated API routes under `/api/v1`
- Health endpoint at `/health`
- JWT access token and refresh token authentication
- Role-based access for `STUDENT`, `INSTRUCTOR`, and `ADMIN`
- Course catalog with categories, modules, lessons, reviews, and related courses
- Student enrollments, lesson progress, assignment submissions, and course reviews
- Instructor-owned course, lesson, module, assignment, blog, and submission review workflows
- Admin user management, platform management, analytics, support management, and AI logs
- Notification routes and automatic notifications for enrollment, support replies, and instructor promotion requests
- Instructor promotion request lifecycle where students request instructor access and admins approve or reject
- Real Gemini AI workflows with structured JSON responses and AI request logging

## Problem Statement

Most learning platforms treat content, progress, assignments, reviews, support, and AI guidance as disconnected features. That creates a weak learner journey: goals are not tied to courses, feedback is not tied to progress, and AI output is not connected to real platform activity. It also creates operational risk because instructors and admins need strict ownership, permissions, and auditability.

## Solution Overview

SkillSync AI Backend API solves this with a modular Express architecture where each domain owns its route, controller, service, validation, and interface layer. Prisma handles PostgreSQL access, Zod validates input contracts, centralized middleware handles errors and authentication, role guards enforce permissions, and AI services call Gemini for real structured responses. The result is a backend that behaves like a serious product API, not a collection of isolated CRUD endpoints.

## Why This Project Stands Out

- **Real AI integration:** Gemini-powered workflows return useful structured outputs and fail safely when provider configuration is missing.
- **Production-style permissions:** RBAC is combined with ownership checks, so students and instructors can only access the records they should.
- **Connected LMS workflows:** Courses, enrollments, lessons, assignments, submissions, reviews, support, and notifications work together.
- **Operational visibility:** AI logs, dashboard analytics, Pino logging, and standardized errors make the system easier to monitor.
- **Scalable module boundaries:** Each domain is isolated enough to grow without turning the codebase into a tangled service layer.

## Key Features

- Authentication and authorization with JWT access tokens, refresh tokens, cookies, Google OAuth helper routes, email verification, and password reset
- Role-based user management for students, instructors, and admins
- Instructor promotion request flow with admin review, approval, rejection, user role update, and notifications
- Course lifecycle with categories, published/draft/archive states, instructor ownership, modules, lessons, previews, ratings, reviews, and related courses
- Enrollment workflow with duplicate protection, published-course enforcement, total enrollment tracking, notifications, and enrollment confirmation email
- Production-safe enrollment email delivery: enrollment is created first, then the email is sent asynchronously and SMTP failures are logged without rolling back the user action
- Lesson progress tracking with enrollment progress recalculation
- Assignment and submission workflow with student submission, instructor/admin review, feedback, score, and status transitions
- Course reviews with enrolled-student checks, rating validation, average rating recalculation, and ownership controls
- Blog management for platform content
- Support ticket workflow with ticket creation, admin status updates, replies, and reply notifications
- Notification API with list, unread count, mark read, mark all read, delete, and admin-created notifications
- Dashboard analytics for students, instructors, and admins
- AI learning tools using Gemini, including roadmap generation, skill-gap analysis, project recommendations, AI chat, course summaries, recommendations, assignment feedback, blog generation, study chat, and career chat
- AI request logs for admin monitoring
- Search, filtering, sorting, and pagination through shared utilities
- Zod validation on request bodies and route params
- Pino HTTP logging, centralized error handling, Helmet, CORS, cookie parsing, body limits, and rate limiting
- Public GET response caching for catalog-style routes such as courses, categories, and blogs

## Tech Stack

- Frontend: Next.js, React, Tailwind CSS, TypeScript
- Backend: Node.js, Express, TypeScript, PostgreSQL, Prisma
- Auth: JWT, Cookies, Google OAuth helper flow, Better Auth-ready configuration
- AI: Gemini provider integration, OpenAI-ready environment placeholder
- Uploads: Multer, local `uploads/` directory
- Email: Nodemailer, EJS templates
- Tools: Bun, Prisma CLI, TypeScript, tsup, Prettier, Vercel, Git, VS Code

## Screenshots / GIFs

Add final deployed screenshots before submission. Recommended file names are included so the README can point to stable assets once captured.

| Area              | Target File                              |
| ----------------- | ---------------------------------------- |
| Landing page      | `docs/screenshots/landing-page.png`      |
| Course listing    | `docs/screenshots/course-listing.png`    |
| Course details    | `docs/screenshots/course-details.png`    |
| Student dashboard | `docs/screenshots/student-dashboard.png` |
| Admin dashboard   | `docs/screenshots/admin-dashboard.png`   |
| AI roadmap result | `docs/screenshots/ai-roadmap-result.png` |

## Dependencies

Major runtime dependencies:

```json
{
  "@prisma/adapter-pg": "^7.8.0",
  "@prisma/client": "7.8.0",
  "bcryptjs": "^3.0.3",
  "better-auth": "^1.6.9",
  "cookie-parser": "^1.4.7",
  "cors": "^2.8.5",
  "dotenv": "^16.5.0",
  "ejs": "^5.0.2",
  "express": "^4.21.2",
  "express-rate-limit": "^8.5.1",
  "helmet": "^8.1.0",
  "http-status": "^2.1.0",
  "jsonwebtoken": "^9.0.3",
  "multer": "^2.1.1",
  "nodemailer": "^8.0.7",
  "pg": "^8.20.0",
  "pino": "^9.6.0",
  "pino-http": "^10.4.0",
  "zod": "^4.4.3"
}
```

Development tools include TypeScript, Prisma CLI, tsx, tsup, Prettier, Node type packages, and package type definitions.

## Live Demo and Credentials

### Project Links

- Frontend Repo: https://github.com/FahimMuntasir0417/SkillSync-AI-Frontend
- Backend Repo: https://github.com/FahimMuntasir0417/SkillSync-AI-Backend
- Frontend Live: https://skill-sync-ai-frontend.vercel.app/
- Backend Live: https://skill-sync-ai-backend.vercel.app/
- Demo Video: https://drive.google.com/file/d/1emZQGxEL78LvL4-J-XpppBt8SJ6slVTa/view?usp=sharing

### Demo Credentials

Use demo credentials only for non-production demonstrations. Password values are controlled by seed environment variables.

| Role       | Email                     | Password         |
| ---------- | ------------------------- | ---------------- |
| Student    | `student@skillsync.ai`    | `Student@123`    |
| Instructor | `instructor@skillsync.ai` | `Instructor@123` |
| Admin      | `admin@skillsync.ai`      | `Admin@123`      |

## Installation and Setup

### Prerequisites

Before running the project, make sure you have:

- Bun installed
- Node.js installed
- PostgreSQL database access
- SMTP credentials for email delivery
- Gemini API key for AI features
- Google OAuth client credentials if testing Google OAuth

### Setup

Clone the repository:

```bash
git clone https://github.com/FahimMuntasir0417/SkillSync-AI-Backend
cd SkillSync-AI-Backend
```

Install dependencies:

```bash
bun install
```

Create a `.env` file in the root directory and add the required environment variables.

Generate the Prisma client:

```bash
bun run prisma:generate
```

Apply database migrations:

```bash
bun run prisma:migrate
```

Seed demo data:

```bash
bun run prisma:seed
```

Run the development server:

```bash
bun run dev
```

The server starts on the port defined by `PORT`, defaulting to `5000`.

### Production Build

```bash
bun run build
bun run start
```

## Environment Variables

Create a `.env` file in the project root. Do not commit real secrets.

### Core

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=your database url
CLIENT_URL= your backend deploy link
```

### Auth and Tokens

```env
JWT_ACCESS_SECRET="replace-with-secure-access-secret"
JWT_REFRESH_SECRET="replace-with-secure-refresh-secret"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
BETTER_AUTH_SECRET="replace-with-better-auth-secret"
BETTER_AUTH_URL=your backend url
```

### Google OAuth

```env
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### Email

```env
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="SkillSync AI <no-reply@skillsync.ai>"
```

### AI Providers

```env
GEMINI_API_KEY=""
OPENAI_API_KEY=""
```

The current AI service uses Gemini. OpenAI is kept as a provider-ready environment placeholder.

### Optional Seed Variables

These values are required by the seed script in local development.

```env
DEMO_STUDENT_PASSWORD="Student@123"
DEMO_INSTRUCTOR_PASSWORD="Instructor@123"
DEMO_ADMIN_PASSWORD="Admin@123"
```

## API and Architecture

### Base URLs

Local development:

```text
http://localhost:5000
```

Versioned application routes:

```text
/api/v1
```

Health check:

```text
GET /health
```

The health response includes service name, version, environment, uptime, and timestamp so deployments can be checked quickly from logs or uptime monitors.

Google OAuth callback helper:

```text
GET /api/auth/callback/google
```

### High-Level Flow

```text
Request
  -> Route
  -> Middleware
  -> Controller
  -> Service
  -> Prisma Client
  -> PostgreSQL
  -> Standard API Response
```

### Architecture Highlights

- Modular service architecture under `src/modules/<moduleName>`
- Single Prisma schema in `prisma/schema.prisma`
- Standard response envelope through `src/common/utils/sendResponse.ts`
- Centralized error handling in `src/common/middlewares/globalErrorHandler.ts`
- Request validation through Zod schemas and `validateRequest`
- Route protection through `checkAuth()` and role authorization through `roleGuard()`
- Shared pagination helper in `src/common/utils/pagination.ts`
- In-memory cache middleware in `src/common/middlewares/cacheResponse.ts` for public GET responses
- AI provider calls isolated in `src/modules/ai/gemini.service.ts`
- AI request history stored in Prisma models for admin review
- Email delivery isolated in `src/common/utils/email.ts` with EJS templates
- Vercel serverless entry in `api/index.ts`

### Module Map

| Module             | Base Route                                                    | Responsibility                                                                                                |
| ------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Health             | `/health`                                                     | Confirms API availability                                                                                     |
| Auth               | `/api/v1/auth`                                                | Registration, login, refresh token, logout, profile, email verification, password reset, Google OAuth helpers |
| Users              | `/api/v1/users`                                               | User listing, profile update, role change, blocking                                                           |
| Categories         | `/api/v1/categories`                                          | Course category management                                                                                    |
| Courses            | `/api/v1/courses`                                             | Course CRUD, public catalog, featured courses, related courses, course details                                |
| Course Modules     | `/api/v1/course-modules`                                      | Course module creation, update, delete                                                                        |
| Lessons            | `/api/v1/lessons`                                             | Lesson creation, update, delete, completion                                                                   |
| Enrollments        | `/api/v1/enrollments`                                         | Course enrollment, my classes, progress update, enrollment details                                            |
| Assignments        | `/api/v1/assignments`                                         | Assignment CRUD and filtered assignment listing                                                               |
| Submissions        | `/api/v1/submissions`                                         | Student submissions, my submissions, pending reviews, status updates                                          |
| Submission Reviews | `/api/v1/submissions/:id/review`, `/api/v1/reviews`           | Instructor/admin feedback and submission review management                                                    |
| Course Reviews     | `/api/v1/courses/:courseId/reviews`, `/api/v1/course-reviews` | Student course reviews and rating management                                                                  |
| Blogs              | `/api/v1/blogs`                                               | Blog creation, listing, update, delete                                                                        |
| Support            | `/api/v1/support`                                             | Support tickets, replies, status updates                                                                      |
| Notifications      | `/api/v1/notifications`                                       | In-app notification listing, unread count, mark read, delete, admin-created notifications                     |
| Promotion Requests | `/api/v1/promotion-requests`                                  | Student instructor promotion requests and admin review                                                        |
| Dashboard          | `/api/v1/dashboard`                                           | Student, instructor, and admin analytics                                                                      |
| AI                 | `/api/v1/ai`                                                  | Gemini-powered AI tools and AI logs                                                                           |

### Access Model

Most protected feature modules use `checkAuth()`.

Authorization accepts:

```text
Authorization: Bearer <accessToken>
```

The active role values are:

```text
STUDENT
INSTRUCTOR
ADMIN
```

### Common Query Parameters

Most list endpoints support some or all of the following:

```text
page
limit
sortBy
sortOrder
search
role
status
priority
type
isRead
categoryId
level
minPrice
maxPrice
```

### Uploads

Multer-backed local uploads are used through the `uploads/` directory.

Current upload handling is suitable for local and demo workflows. For long-term production storage, use an external object storage provider such as S3, Cloudinary, or UploadThing.

## Folder Structure

```text
SkillSync AI Backend/
|
+-- api/
|   +-- index.ts
+-- docs/
|   +-- *.json
|   +-- postman/
+-- prisma/
|   +-- migrations/
|   +-- schema.prisma
+-- src/
|   +-- app.ts
|   +-- server.ts
|   +-- routes.ts
|   +-- common/
|   |   +-- errors/
|   |   +-- middlewares/
|   |   +-- templates/
|   |   +-- types/
|   |   +-- utils/
|   +-- config/
|   +-- modules/
|   |   +-- ai/
|   |   +-- assignments/
|   |   +-- auth/
|   |   +-- blogs/
|   |   +-- categories/
|   |   +-- courseModules/
|   |   +-- courseReviews/
|   |   +-- courses/
|   |   +-- dashboard/
|   |   +-- enrollments/
|   |   +-- lessons/
|   |   +-- notifications/
|   |   +-- promotionRequests/
|   |   +-- reviews/
|   |   +-- submissions/
|   |   +-- support/
|   |   +-- users/
|   +-- prisma/
|   |   +-- seed.ts
|   +-- utils/
+-- uploads/
+-- package.json
+-- prisma.config.ts
+-- tsconfig.json
+-- vercel.json
```

## Available Scripts

| Command                   | Description                                   |
| ------------------------- | --------------------------------------------- |
| `bun run dev`             | Run the API with `tsx watch`                  |
| `bun run build`           | Compile the server with `tsup`                |
| `bun run vercel-build`    | Generate Prisma client and build for Vercel   |
| `bun run start`           | Run the compiled server from `dist/server.js` |
| `bun run prisma:generate` | Generate Prisma Client                        |
| `bun run prisma:migrate`  | Run Prisma development migrations             |
| `bun run prisma:deploy`   | Apply production migrations                   |
| `bun run prisma:studio`   | Open Prisma Studio                            |
| `bun run prisma:seed`     | Seed demo data                                |
| `bun run lint`            | Run TypeScript compile check                  |
| `bun run format`          | Format the repository with Prettier           |

## Notable Workflows

### Authentication Flow

Registration creates a student account by default. Login returns access and refresh tokens and sets auth cookies. Email verification and password reset use OTP-style verification records and EJS email templates.

### Student Learning Flow

A student browses published courses, enrolls in a course, receives an enrollment email, gets enrollment notifications, completes lessons, tracks progress, submits assignments, writes course reviews, and opens support tickets.

### Instructor Course Flow

An instructor can manage owned courses, modules, lessons, assignments, blogs, and submission reviews. Ownership checks prevent instructors from modifying courses they do not own.

### Instructor Promotion Flow

A student submits an instructor promotion request through `/api/v1/promotion-requests`. Admins can approve or reject it. Approval updates the requester role to `INSTRUCTOR`, records admin feedback, stores review metadata, and sends a notification.

### Notification Flow

Notifications are created for enrollment events, support replies, admin-created messages, and promotion request decisions. Users can view notifications, check unread count, mark one or all as read, and delete their own notifications.

### AI Workflow

AI endpoints call Gemini with structured prompts and JSON output expectations. Results are saved in AI-specific history tables or `AiRequestLog` depending on the feature. If no Gemini key is configured, AI routes return a service error rather than fake content.

### Support Flow

Students and authenticated users can create tickets. Admins can update ticket status. Ticket owners and admins can reply. Admin replies create notifications for ticket owners.

## Documentation and Reference Files

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
- `docs/notification-routes.json`
- `docs/promotion-request-routes.json`
- `docs/dashboard-routes.json`
- `docs/ai-routes.json`

Postman and HTTP examples:

- `docs/postman/skillsync-auth.postman_collection.json`
- `docs/postman/skillsync-auth.postman_environment.json`
- `docs/postman/skillsync-auth.http`

Frontend guide:

- `docs/frontend-nextjs-implementation.md`

Manual testing:

- `TESTING.md`

## Deployment Notes

- Set `NODE_ENV=production`.
- Set all required environment variables in the hosting provider.
- Run `bun run prisma:deploy` before using production APIs.
- Use `bun run vercel-build` for Vercel builds.
- Ensure `CLIENT_URL`, `BETTER_AUTH_URL`, and Google OAuth settings match deployed domains.
- Configure SMTP credentials before testing enrollment email, email verification, and password reset.
- Configure `GEMINI_API_KEY` before testing AI features.
- Production health URL: `/health`.

## Quality Signals

This project is structured to show the signals recruiters and reviewers look for in a serious full-stack submission:

- **Clear problem understanding:** the API connects AI planning to actual LMS activity instead of treating AI as a separate gimmick.
- **Clean installation steps:** setup, migrations, seed data, scripts, and environment variables are documented.
- **System design thinking:** modules, services, validation, middleware, Prisma relations, and API response contracts are separated intentionally.
- **Security awareness:** secrets stay in env vars, JWTs are protected, roles are enforced, ownership checks are service-level, and passwords are never returned.
- **Scalability considerations:** shared pagination, centralized errors, logging, AI provider isolation, Prisma indexes, and modular domains make the project easier to extend.
- **Demo readiness:** seeded users, courses, assignments, notifications, support tickets, and AI logs make the platform easy to present.

## Contributions

If this is a team project, list contributors here.

| Name     | Role | Contributions |
| -------- | ---- | ------------- |
| Member-1 | Role | Contributions |
| Member-2 | Role | Contributions |

## How to Contribute

1. Fork the project.
2. Create a branch: `git checkout -b feature/amazing-feature`.
3. Commit changes: `git commit -m "Add amazing feature"`.
4. Push the branch: `git push origin feature/amazing-feature`.
5. Open a pull request.

## License

This project currently declares the ISC license in `package.json`. Add a dedicated `LICENSE` or `LICENSE.txt` file if the project should be distributed with full license text.

## Contact

- Live URL: https://skill-sync-ai-backend.vercel.app/
- Frontend: https://skill-sync-ai-frontend.vercel.app/
- Backend Repo: https://github.com/FahimMuntasir0417/SkillSync-AI-Backend
- Frontend Repo: https://github.com/FahimMuntasir0417/SkillSync-AI-Frontend
- Email: fahimmuntasirbejoy@gmail.com
- WhatsApp: 01571042536
- Facebook: https://www.facebook.com/mohammad.fahim.muntasir
- LinkedIn: https://www.linkedin.com/in/md-fahim-muntasir-aa536b366/

## Current Entry Points

- Health check: `GET /health`
- App bootstrap: `src/app.ts`
- Server start: `src/server.ts`
- API route registration: `src/routes.ts`
- Vercel entry: `api/index.ts`
