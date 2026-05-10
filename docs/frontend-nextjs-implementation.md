# SkillSync AI Frontend Implementation Guide with Next.js

This document describes how to build a proper Next.js frontend for the SkillSync AI Backend.

## Recommended Stack

- Next.js App Router
- TypeScript
- Tailwind CSS or a component system such as shadcn/ui
- TanStack Query for client-side server state
- React Hook Form with Zod for forms
- Axios or native `fetch`
- Zustand or React Context for lightweight auth/user state

## Environment Variables

Create `.env.local` in the frontend project:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

For production:

```env
NEXT_PUBLIC_API_BASE_URL=https://skill-sync-ai-backend.vercel.app/api/v1
NEXT_PUBLIC_BACKEND_URL=https://skill-sync-ai-backend.vercel.app
```

The backend `CLIENT_URL` must match the frontend origin, for example:

```env
CLIENT_URL=https://skill-sync-ai-frontend.vercel.app
```

## Suggested Folder Structure

```text
src/
  app/
    (auth)/
      login/
      register/
      verify-email/
      forgot-password/
      reset-password/
    (dashboard)/
      dashboard/
      student/
      instructor/
      admin/
    courses/
      page.tsx
      [slug]/
        page.tsx
    blogs/
    support/
    ai/
  components/
    auth/
    courses/
    dashboard/
    forms/
    layout/
    shared/
  config/
    env.ts
  lib/
    api/
      client.ts
      auth.api.ts
      courses.api.ts
      enrollments.api.ts
      assignments.api.ts
      submissions.api.ts
      reviews.api.ts
      support.api.ts
      ai.api.ts
    auth/
      token.ts
      require-role.ts
    query/
      query-client.ts
  types/
    api.ts
    auth.ts
    course.ts
    dashboard.ts
```

## API Client

Use one shared API client so auth headers, error handling, and base URL stay consistent.

```ts
// src/lib/api/client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type PaginatedResponse<T> = ApiResponse<T> & {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
};

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    credentials: "include",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Request failed");
  }

  return result;
}
```

## Authentication Flow

The backend returns `accessToken` in login/register responses and also sets HTTP-only cookies. Protected backend routes currently expect:

```http
Authorization: Bearer <accessToken>
```

Recommended frontend behavior:

1. Register user through `POST /auth/register`.
2. Store `data.accessToken` in memory or local storage.
3. Ask user to verify email through `POST /auth/verify-email`.
4. Login through `POST /auth/login`.
5. Attach `Authorization` header to protected requests.
6. On `401`, call `POST /auth/refresh-token`.
7. If refresh fails, clear auth state and redirect to login.

Example:

```ts
// src/lib/api/auth.api.ts
import { apiRequest, type ApiResponse } from "./client";

export type UserRole = "STUDENT" | "INSTRUCTOR" | "ADMIN";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  avatarUrl?: string | null;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

export const authApi = {
  login: (payload: { email: string; password: string }) =>
    apiRequest<ApiResponse<LoginResponse>>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  register: (payload: { name: string; email: string; password: string }) =>
    apiRequest<ApiResponse<LoginResponse>>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  me: () => apiRequest<ApiResponse<AuthUser>>("/auth/me"),

  logout: () =>
    apiRequest<ApiResponse<null>>("/auth/logout", {
      method: "POST",
    }),
};
```

## Role-Based Routing

Use role-aware layouts or guards.

```ts
export function canAccessDashboard(
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN",
  target: "student" | "instructor" | "admin",
) {
  if (target === "student") return role === "STUDENT";
  if (target === "instructor") return role === "INSTRUCTOR";
  if (target === "admin") return role === "ADMIN";
  return false;
}
```

Recommended dashboards:

- Student: `/student`
- Instructor: `/instructor`
- Admin: `/admin`

Backend dashboard endpoints:

```text
GET /dashboard/student
GET /dashboard/instructor
GET /dashboard/admin
```

## Public Pages

Public routes should not require login:

- Course listing: `GET /courses`
- Featured courses: `GET /courses/featured`
- Course details: `GET /courses/:slug`
- Course reviews: `GET /courses/:courseId/reviews`
- Blog listing: `GET /blogs`
- Blog details: `GET /blogs/:slug`

Recommended pages:

```text
/courses
/courses/[slug]
/blogs
/blogs/[slug]
```

## Student Flows

Student pages should support:

- Browse courses
- Enroll in a course
- View my classes
- Complete lessons
- View assignments
- Submit assignments
- View submission review
- Review completed/enrolled courses
- Create support tickets
- Use AI study tools

Important endpoints:

```text
POST /enrollments/:courseId
GET /enrollments/my-classes
PATCH /lessons/:id/complete
GET /assignments
POST /submissions
GET /submissions/my-submissions
POST /courses/:courseId/reviews
POST /support/tickets
POST /ai/study-chat
POST /ai/course-summary
POST /ai/recommendations
```

## Instructor Flows

Instructor pages should support:

- Create and manage own courses
- Create modules and lessons
- Create assignments
- Review pending submissions
- Write blogs

Important endpoints:

```text
POST /courses
PATCH /courses/:id
DELETE /courses/:id
POST /course-modules
POST /lessons
POST /assignments
GET /submissions/pending
POST /submissions/:id/review
POST /blogs
```

The backend enforces ownership, but the frontend should still hide actions for courses not owned by the instructor.

## Admin Flows

Admin pages should support:

- Manage users
- Manage categories
- Manage all courses
- View platform dashboard
- Manage support ticket status
- View AI request logs

Important endpoints:

```text
GET /users
PATCH /users/:id/role
PATCH /users/:id/block
POST /categories
GET /dashboard/admin
PATCH /support/tickets/:id/status
GET /ai/logs
```

## Forms and Validation

Mirror backend Zod rules on the frontend. Keep schemas close to each form.

Example login schema:

```ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});
```

For create course:

```ts
export const createCourseSchema = z.object({
  title: z.string().min(3).max(200),
  shortDescription: z.string().min(10).max(300),
  description: z.string().min(20),
  thumbnail: z.string().url(),
  previewVideoUrl: z.string().url().optional(),
  price: z.number().nonnegative().optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  durationInHours: z.number().int().nonnegative().optional(),
  categoryId: z.string().uuid(),
});
```

## Data Fetching Strategy

Use server components for public SEO pages:

- `/courses`
- `/courses/[slug]`
- `/blogs`
- `/blogs/[slug]`

Use client components with TanStack Query for authenticated dashboards:

- Student dashboard
- Instructor dashboard
- Admin dashboard
- Assignment submission
- Support ticket replies
- AI chat tools

Example query key style:

```ts
export const queryKeys = {
  courses: ["courses"] as const,
  course: (slug: string) => ["course", slug] as const,
  myClasses: ["my-classes"] as const,
  pendingSubmissions: ["pending-submissions"] as const,
  aiLogs: (page: number) => ["ai-logs", page] as const,
};
```

## File Uploads

Profile image update uses multipart form data:

```text
PATCH /auth/users/me
```

Send:

- `image`: file
- `data`: JSON string containing profile fields

Example:

```ts
const formData = new FormData();
formData.append("image", file);
formData.append(
  "data",
  JSON.stringify({
    name: "Ayesha Rahman",
    bio: "Full-stack learner",
  }),
);
```

Do not set `Content-Type` manually for multipart requests. Let the browser set the boundary.

## AI UX Recommendations

AI routes can take time, so each AI tool should include:

- Loading state
- Retry button
- Error state for `503 AI provider is not configured`
- Clear generated result section
- No fake fallback output

Recommended AI pages:

```text
/ai/study-chat
/ai/roadmap
/ai/skill-gap
/ai/projects
/ai/career-chat
```

## Error Handling

Backend error shape:

```json
{
  "success": false,
  "message": "Error message",
  "errors": []
}
```

Frontend should display:

- `message` as the main toast/form error
- field-level errors from `errors[].path` when present
- login redirect on `401`
- forbidden page on `403`
- not-found page on `404`

## Production Checklist

- Set backend `CLIENT_URL` to `https://skill-sync-ai-frontend.vercel.app`.
- Set frontend `NEXT_PUBLIC_API_BASE_URL` to `https://skill-sync-ai-backend.vercel.app/api/v1`.
- Use HTTPS in production.
- Hide UI actions that the current role cannot perform.
- Keep protected dashboard routes behind an auth guard.
- Handle token refresh and logout consistently.
- Add empty states for lists.
- Add loading and error states for every API request.
- Add optimistic updates only where rollback is simple.
- Keep AI tools rate-limit friendly with disabled submit buttons while pending.
- Test student, instructor, and admin flows separately.
