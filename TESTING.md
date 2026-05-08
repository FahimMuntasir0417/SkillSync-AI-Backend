# SkillSync AI Manual Testing Guide

Base URL:

```text
http://localhost:5000
```

Production:

```text
https://skill-sync-ai-backend.vercel.app
```

Use `Authorization: Bearer <accessToken>` for protected routes.

## Health Check

```http
GET /health
```

## Register

```http
POST /api/v1/auth/register
```

```json
{
  "name": "SkillSync Member",
  "email": "member@example.com",
  "password": "StrongPass123"
}
```

## Login

```http
POST /api/v1/auth/login
```

```json
{
  "email": "student@skillsync.ai",
  "password": "<DEMO_STUDENT_PASSWORD>"
}
```

## Refresh Token

```http
POST /api/v1/auth/refresh-token
```

Requires refresh token cookie.

## Get Current User

```http
GET /api/v1/auth/me
```

## Create Category

```http
POST /api/v1/categories
```

```json
{
  "name": "Backend Development",
  "description": "Courses about scalable backend APIs",
  "iconUrl": "https://example.com/backend.png"
}
```

## Create Course

```http
POST /api/v1/courses
```

```json
{
  "title": "Complete Backend Development with Node.js",
  "shortDescription": "Learn scalable backend APIs with Express, Prisma, and PostgreSQL.",
  "description": "A practical course covering API design, authentication, validation, databases, and deployment.",
  "thumbnail": "https://example.com/backend-course.png",
  "previewVideoUrl": "https://example.com/preview.mp4",
  "price": 49,
  "level": "INTERMEDIATE",
  "status": "PUBLISHED",
  "durationInHours": 18,
  "categoryId": "category_uuid"
}
```

## Course Listing

```http
GET /api/v1/courses?search=backend&level=INTERMEDIATE&page=1&limit=10&sortBy=createdAt&sortOrder=desc
```

## Create Course Module

```http
POST /api/v1/course-modules
```

```json
{
  "title": "Authentication and Authorization",
  "description": "Learn JWT, refresh tokens, and role-based access.",
  "order": 1,
  "courseId": "course_uuid"
}
```

## Create Lesson

```http
POST /api/v1/lessons
```

```json
{
  "title": "Understanding JWT Access Tokens",
  "content": "In this lesson, students learn how access tokens work.",
  "videoUrl": "https://example.com/video.mp4",
  "resourceUrl": "https://example.com/resource.pdf",
  "order": 1,
  "isPreview": false,
  "moduleId": "module_uuid"
}
```

## Enroll In Course

```http
POST /api/v1/enrollments/course_uuid
```

## Get My Classes

```http
GET /api/v1/enrollments/my-classes
```

## Complete Lesson

```http
PATCH /api/v1/lessons/lesson_uuid/complete
```

## Create Assignment

```http
POST /api/v1/assignments
```

```json
{
  "title": "Build a REST API with Express and Prisma",
  "description": "Create a production-ready CRUD API with validation and authentication.",
  "courseId": "course_uuid",
  "dueDate": "2026-06-01T23:59:59.000Z",
  "status": "ACTIVE"
}
```

## Submit Assignment

```http
POST /api/v1/submissions
```

```json
{
  "assignmentId": "assignment_uuid",
  "githubUrl": "https://github.com/user/project",
  "liveUrl": "https://project.vercel.app",
  "notes": "I implemented authentication, validation, and Prisma relations."
}
```

## Review Submission

```http
POST /api/v1/submissions/submission_uuid/review
```

```json
{
  "feedback": "Good folder structure and clean API design. Add more tests and improve README.",
  "score": 85,
  "submissionStatus": "APPROVED"
}
```

## Create Course Review

```http
POST /api/v1/courses/course_uuid/reviews
```

```json
{
  "rating": 5,
  "comment": "Excellent course for understanding backend architecture."
}
```

## Create Blog

```http
POST /api/v1/blogs
```

```json
{
  "title": "How to Learn Backend Development in 2026",
  "excerpt": "A practical roadmap for learning backend engineering with Node.js and PostgreSQL.",
  "content": "Backend development is about designing reliable APIs, databases, and systems.",
  "thumbnail": "https://example.com/blog.png",
  "tags": ["backend", "nodejs", "postgresql"],
  "published": true
}
```

## Create Support Ticket

```http
POST /api/v1/support/tickets
```

```json
{
  "subject": "I cannot access my course",
  "message": "I enrolled in the backend course, but it is not showing in My Classes.",
  "priority": "HIGH"
}
```

## Reply To Support Ticket

```http
POST /api/v1/support/tickets/ticket_uuid/replies
```

```json
{
  "message": "We checked your enrollment and fixed the issue."
}
```

## Get Notifications

Notification records are currently created by support replies and system actions. A public notification-read API is not implemented yet; verify notification rows in Prisma Studio.

```bash
bunx prisma studio
```

## Dashboard Stats

```http
GET /api/v1/dashboard/student
GET /api/v1/dashboard/instructor
GET /api/v1/dashboard/admin
```

Use the matching role token.

## AI Without API Key

With both keys empty:

```env
OPENAI_API_KEY=""
GEMINI_API_KEY=""
```

Request:

```http
POST /api/v1/ai/chat
```

```json
{
  "message": "Explain JWT refresh token in simple terms"
}
```

Expected: `503 AI provider is not configured`.

## Protected Route Without Token

```http
GET /api/v1/users/me
```

Expected: `401 Access token is required`.

## Role Protection

Try creating a category with a student token:

```http
POST /api/v1/categories
```

Expected: `403 You are not authorized`.
