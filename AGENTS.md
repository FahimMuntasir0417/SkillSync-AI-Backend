# AGENTS.md

## Project Purpose

SkillSync AI Backend is a production-ready API for an AI-powered learning management platform with courses, lessons, enrollments, assignments, reviews, support, dashboards, and AI learning tools.

## Tech Stack

Node.js, Express.js, TypeScript, ESM, Prisma, PostgreSQL, JWT, Zod, Pino, Better Auth-ready config, OpenAI/Gemini-ready AI provider layer.

## Folder Structure

```text
src/
  app.ts
  server.ts
  routes.ts
  config/
  common/
  modules/
  prisma/
docs/
prisma/
api/
```

## Coding Conventions

- Use TypeScript strict mode.
- Use ESM imports with `.js` extensions for local files.
- Keep modules organized as controller, service, route, validation, interface.
- Use Prisma APIs instead of raw SQL unless required.
- Use Zod for request validation.
- Use standard response helpers.

## Module Conventions

Each module should keep:

```text
module.controller.ts
module.service.ts
module.route.ts
module.validation.ts
module.interface.ts
```

Add module routes to `src/routes.ts`.

## Response Format

Success:

```json
{
  "success": true,
  "message": "Message",
  "data": {}
}
```

Paginated:

```json
{
  "success": true,
  "message": "Message",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPage": 10
  },
  "data": []
}
```

Error:

```json
{
  "success": false,
  "message": "Error message",
  "errors": []
}
```

## Error Handling Rules

- Throw `AppError` for operational errors.
- Let `globalErrorHandler` format errors.
- Do not leak passwords, secrets, or stack traces in production.

## Auth Rules

- JWT is the active authentication system.
- Use `checkAuth()` for protected routes.
- Use `roleGuard()` for role-specific routes.
- Better Auth is prepared but not mounted.

## Role Rules

- Student: learning, enrollment, submission, course review.
- Instructor: own courses, modules, lessons, assignments, submission reviews.
- Admin: full platform management and analytics.

## Run Project

```bash
bun install
bun run dev
```

## Migrate Database

```bash
bunx prisma migrate dev --name init
bunx prisma generate
```

## Seed Database

```bash
bun run prisma:seed
```

## Build

```bash
bun run lint
bun run build
```

## Do-Not Rules

- Do not create duplicate user systems.
- Do not mount Better Auth routes until OAuth is fully verified.
- Do not return user passwords.
- Do not generate fake AI responses.
- Do not bypass Zod validation.
- Do not skip ownership checks.

## Definition of Done

- Code compiles with `bun run lint`.
- Build passes with `bun run build`.
- Routes are added to `src/routes.ts`.
- Request validation exists.
- Permissions are enforced.
- Docs JSON is updated when routes change.
