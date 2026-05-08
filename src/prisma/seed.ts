import {
  AiFeatureType,
  AiRequestStatus,
  AssignmentStatus,
  CourseLevel,
  CourseStatus,
  NotificationType,
  SubmissionStatus,
  TicketPriority,
  TicketStatus,
  UserRole,
  UserStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

import { slugify } from "../common/utils/slugify.js";
import { prisma } from "../config/prisma.js";

const hashPassword = (password: string) => bcrypt.hash(password, 12);

const getRequiredSeedEnv = (key: string) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required seed environment variable: ${key}`);
  }

  return value;
};

const thumbnail = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

const resetDatabase = async () => {
  await prisma.aiRequestLog.deleteMany();
  await prisma.aiChatMessage.deleteMany();
  await prisma.aiProjectRecommendation.deleteMany();
  await prisma.aiSkillGapAnalysis.deleteMany();
  await prisma.aiRoadmap.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.supportMessage.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.review.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.courseReview.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.courseModule.deleteMany();
  await prisma.course.deleteMany();
  await prisma.blog.deleteMany();
  await prisma.category.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
};

const main = async () => {
  await resetDatabase();

  const demoStudentPassword = getRequiredSeedEnv("DEMO_STUDENT_PASSWORD");
  const demoInstructorPassword = getRequiredSeedEnv("DEMO_INSTRUCTOR_PASSWORD");
  const demoAdminPassword = getRequiredSeedEnv("DEMO_ADMIN_PASSWORD");

  const [studentPassword, instructorPassword, adminPassword] = await Promise.all([
    hashPassword(demoStudentPassword),
    hashPassword(demoInstructorPassword),
    hashPassword(demoAdminPassword),
  ]);

  const [student, instructor, admin] = await Promise.all([
    prisma.user.create({
      data: {
        name: "SkillSync Student",
        email: "student@skillsync.ai",
        password: studentPassword,
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        bio: "A focused learner building full-stack backend skills.",
        avatarUrl: "https://i.pravatar.cc/300?img=32",
      },
    }),
    prisma.user.create({
      data: {
        name: "SkillSync Instructor",
        email: "instructor@skillsync.ai",
        password: instructorPassword,
        role: UserRole.INSTRUCTOR,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        bio: "Backend engineer teaching production Node.js and database design.",
        avatarUrl: "https://i.pravatar.cc/300?img=12",
      },
    }),
    prisma.user.create({
      data: {
        name: "SkillSync Admin",
        email: "admin@skillsync.ai",
        password: adminPassword,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        bio: "Platform administrator for SkillSync AI.",
        avatarUrl: "https://i.pravatar.cc/300?img=5",
      },
    }),
  ]);

  const categoryNames = [
    "Frontend Development",
    "Backend Development",
    "Full Stack Development",
    "AI Engineering",
    "Database",
    "DevOps",
  ];

  const categories = await Promise.all(
    categoryNames.map((name) =>
      prisma.category.create({
        data: {
          name,
          slug: slugify(name),
          description: `Practical courses and projects for ${name.toLowerCase()}.`,
          iconUrl: `https://api.dicebear.com/8.x/shapes/svg?seed=${encodeURIComponent(name)}`,
        },
      }),
    ),
  );

  const categoryByName = new Map(categories.map((category) => [category.name, category]));

  const coursesData = [
    {
      title: "Complete Backend Development with Node.js",
      category: "Backend Development",
      level: CourseLevel.INTERMEDIATE,
      price: 49,
      durationInHours: 18,
      thumbnail: thumbnail("photo-1516321318423-f06f85e504b3"),
      shortDescription: "Build scalable APIs with Express, Prisma, PostgreSQL, JWT, and production deployment.",
      description:
        "A complete backend engineering course focused on API architecture, authentication, Prisma data modeling, validation, observability, and deployment workflows.",
    },
    {
      title: "Frontend Engineering with Next.js",
      category: "Frontend Development",
      level: CourseLevel.INTERMEDIATE,
      price: 59,
      durationInHours: 16,
      thumbnail: thumbnail("photo-1555066931-4365d14bab8c"),
      shortDescription: "Create polished frontend applications with Next.js, TypeScript, and modern UI patterns.",
      description:
        "Learn app routing, server components, API integration, form handling, and accessible interface design for production-grade frontend products.",
    },
    {
      title: "Full Stack SaaS Development",
      category: "Full Stack Development",
      level: CourseLevel.ADVANCED,
      price: 89,
      durationInHours: 28,
      thumbnail: thumbnail("photo-1460925895917-afdab827c52f"),
      shortDescription: "Design and ship a real SaaS product with authentication, billing-ready architecture, and dashboards.",
      description:
        "A project-driven course that connects frontend, backend, database, authorization, deployment, analytics, and admin workflows.",
    },
    {
      title: "PostgreSQL and Prisma Mastery",
      category: "Database",
      level: CourseLevel.INTERMEDIATE,
      price: 39,
      durationInHours: 14,
      thumbnail: thumbnail("photo-1544383835-bda2bc66a55d"),
      shortDescription: "Model relational data, write efficient queries, and manage migrations confidently.",
      description:
        "Master relational schema design, Prisma relations, migrations, indexes, transactions, pagination, and production database practices.",
    },
    {
      title: "AI Integration for Web Apps",
      category: "AI Engineering",
      level: CourseLevel.INTERMEDIATE,
      price: 69,
      durationInHours: 15,
      thumbnail: thumbnail("photo-1677442136019-21780ecad995"),
      shortDescription: "Add AI workflows to web products with structured prompts, logs, and provider safety checks.",
      description:
        "Learn to connect AI providers, design structured JSON outputs, log requests, handle provider failures, and build AI-assisted user experiences.",
    },
    {
      title: "DevOps Deployment Fundamentals",
      category: "DevOps",
      level: CourseLevel.BEGINNER,
      price: 29,
      durationInHours: 10,
      thumbnail: thumbnail("photo-1518770660439-4636190af475"),
      shortDescription: "Deploy APIs, manage environment variables, and monitor production releases.",
      description:
        "A practical introduction to build pipelines, database migrations, serverless deployment, production env vars, and release checks.",
    },
    {
      title: "TypeScript for Professional Developers",
      category: "Full Stack Development",
      level: CourseLevel.BEGINNER,
      price: 35,
      durationInHours: 12,
      thumbnail: thumbnail("photo-1515879218367-8466d910aaa4"),
      shortDescription: "Use TypeScript strict mode to design safer APIs, services, and application contracts.",
      description:
        "Develop professional TypeScript habits with type narrowing, interfaces, generics, API DTOs, Prisma types, and strict compiler settings.",
    },
    {
      title: "Authentication and Security Masterclass",
      category: "Backend Development",
      level: CourseLevel.ADVANCED,
      price: 79,
      durationInHours: 20,
      thumbnail: thumbnail("photo-1563986768494-4dee2763ff3f"),
      shortDescription: "Implement JWT auth, refresh tokens, RBAC, password reset, and secure middleware.",
      description:
        "A deep dive into authentication systems, secure cookies, authorization guards, password hashing, account protection, and production security headers.",
    },
  ];

  const createdCourses = [];

  for (const courseData of coursesData) {
    const course = await prisma.course.create({
      data: {
        title: courseData.title,
        slug: slugify(courseData.title),
        shortDescription: courseData.shortDescription,
        description: courseData.description,
        thumbnail: courseData.thumbnail,
        previewVideoUrl: "https://example.com/course-preview.mp4",
        price: courseData.price,
        level: courseData.level,
        status: CourseStatus.PUBLISHED,
        durationInHours: courseData.durationInHours,
        categoryId: categoryByName.get(courseData.category)!.id,
        instructorId: instructor.id,
        modules: {
          create: [
            {
              title: "Foundation and Architecture",
              description: "Core ideas, project setup, and architecture decisions.",
              order: 1,
              lessons: {
                create: [
                  {
                    title: `Introduction to ${courseData.title}`,
                    content: `This lesson explains what you will build in ${courseData.title} and how the course is structured.`,
                    videoUrl: "https://example.com/lesson-intro.mp4",
                    resourceUrl: "https://example.com/resources/course-notes.pdf",
                    order: 1,
                    isPreview: true,
                  },
                  {
                    title: "Production Project Setup",
                    content: "Configure a clean project structure, environment variables, scripts, and baseline tooling.",
                    videoUrl: "https://example.com/lesson-setup.mp4",
                    order: 2,
                  },
                ],
              },
            },
            {
              title: "Real-World Implementation",
              description: "Build feature-complete workflows with validation and persistence.",
              order: 2,
              lessons: {
                create: [
                  {
                    title: "Data Modeling and Validation",
                    content: "Design practical data models and validate user input before it reaches business logic.",
                    videoUrl: "https://example.com/lesson-modeling.mp4",
                    order: 1,
                  },
                  {
                    title: "Testing and Deployment Readiness",
                    content: "Prepare the project for production by checking build output, migrations, and manual testing flows.",
                    videoUrl: "https://example.com/lesson-deploy.mp4",
                    resourceUrl: "https://example.com/resources/deployment-checklist.pdf",
                    order: 2,
                  },
                ],
              },
            },
          ],
        },
        assignments: {
          create: [
            {
              title: `Build a portfolio project for ${courseData.title}`,
              description:
                "Create a focused project that demonstrates the core concepts from this course with a clear README and deployment notes.",
              dueDate: new Date("2026-06-01T23:59:59.000Z"),
              status: AssignmentStatus.ACTIVE,
            },
          ],
        },
      },
      include: {
        modules: { include: { lessons: true }, orderBy: { order: "asc" } },
        assignments: true,
      },
    });

    const totalLessons = course.modules.reduce((sum, moduleItem) => sum + moduleItem.lessons.length, 0);
    const updatedCourse = await prisma.course.update({
      where: { id: course.id },
      data: { totalLessons },
      include: { modules: { include: { lessons: true } }, assignments: true },
    });
    createdCourses.push(updatedCourse);
  }

  const [firstCourse, secondCourse] = createdCourses;

  if (!firstCourse || !secondCourse) {
    throw new Error("Seed expected at least two courses to be created.");
  }

  const firstEnrollment = await prisma.enrollment.create({
    data: { userId: student.id, courseId: firstCourse.id, progress: 50 },
  });
  await prisma.enrollment.create({
    data: { userId: student.id, courseId: secondCourse.id, progress: 25 },
  });
  await prisma.course.update({ where: { id: firstCourse.id }, data: { totalEnrollments: 1 } });
  await prisma.course.update({ where: { id: secondCourse.id }, data: { totalEnrollments: 1 } });

  const completedLessons = firstCourse.modules.flatMap((moduleItem) => moduleItem.lessons).slice(0, 2);
  await prisma.lessonProgress.createMany({
    data: completedLessons.map((lesson) => ({
      userId: student.id,
      lessonId: lesson.id,
      completed: true,
      completedAt: new Date(),
    })),
  });

  const submission = await prisma.submission.create({
    data: {
      assignmentId: firstCourse.assignments[0]!.id,
      studentId: student.id,
      githubUrl: "https://github.com/FahimMuntasir0417/skillsync-demo-api",
      liveUrl: "https://skillsync-demo-api.vercel.app",
      notes: "Implemented authentication, validation, Prisma relations, and deployment notes.",
      status: SubmissionStatus.APPROVED,
    },
  });

  await prisma.review.create({
    data: {
      submissionId: submission.id,
      reviewerId: instructor.id,
      feedback: "Strong structure and clean API design. Add broader integration tests in the next iteration.",
      score: 88,
    },
  });

  await prisma.courseReview.createMany({
    data: [
      {
        courseId: firstCourse.id,
        userId: student.id,
        rating: 5,
        comment: "The backend architecture examples were practical and easy to apply.",
      },
      {
        courseId: secondCourse.id,
        userId: student.id,
        rating: 4,
        comment: "Clear explanation of frontend engineering workflow and API integration.",
      },
    ],
  });

  await prisma.course.update({ where: { id: firstCourse.id }, data: { averageRating: 5, totalReviews: 1 } });
  await prisma.course.update({ where: { id: secondCourse.id }, data: { averageRating: 4, totalReviews: 1 } });

  const blogs = [
    "How to Learn Backend Development in 2026",
    "Why TypeScript Matters for Full Stack Engineers",
    "Prisma vs Raw SQL for Modern APIs",
    "How AI Can Improve Student Learning",
  ];
  await Promise.all(
    blogs.map((title) =>
      prisma.blog.create({
        data: {
          title,
          slug: slugify(title),
          excerpt: `${title} explained with practical advice for modern software teams.`,
          content: `${title} requires a balance of fundamentals, deliberate practice, projects, and feedback. This article gives a practical roadmap for learners using SkillSync AI.`,
          thumbnail: thumbnail("photo-1499750310107-5fef28a66643"),
          tags: ["skillsync", "learning", "engineering"],
          published: true,
          authorId: instructor.id,
        },
      }),
    ),
  );

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: student.id,
      subject: "I cannot access my backend course",
      message: "I enrolled in the backend course, but it was not visible in My Classes immediately.",
      priority: TicketPriority.HIGH,
      status: TicketStatus.IN_PROGRESS,
    },
  });

  await prisma.supportMessage.createMany({
    data: [
      {
        ticketId: ticket.id,
        senderId: student.id,
        message: "I refreshed the page and still cannot see the course.",
      },
      {
        ticketId: ticket.id,
        senderId: admin.id,
        message: "We checked your enrollment and restored the course in My Classes.",
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: student.id,
        title: "Enrollment confirmed",
        message: `You are enrolled in ${firstCourse.title}.`,
        type: NotificationType.ENROLLMENT,
      },
      {
        userId: student.id,
        title: "Submission reviewed",
        message: "Your backend API assignment has been approved.",
        type: NotificationType.REVIEW,
      },
      {
        userId: instructor.id,
        title: "New student enrollment",
        message: `A student enrolled in ${firstCourse.title}.`,
        type: NotificationType.SYSTEM,
      },
    ],
  });

  await prisma.aiRequestLog.createMany({
    data: [
      {
        userId: student.id,
        feature: AiFeatureType.ROADMAP_GENERATOR,
        prompt: "Create a six-month backend developer roadmap.",
        response: { roadmapTitle: "Backend Developer Roadmap", phases: [] },
        status: AiRequestStatus.SUCCESS,
      },
      {
        userId: student.id,
        feature: AiFeatureType.SKILL_GAP_ANALYZER,
        prompt: "Compare JavaScript skills with backend developer requirements.",
        response: { missingSkills: ["PostgreSQL indexing", "API testing"] },
        status: AiRequestStatus.SUCCESS,
      },
    ],
  });

  console.log("Seed completed successfully.");
  console.log("Demo credentials:");
  console.log("Student: student@skillsync.ai / DEMO_STUDENT_PASSWORD");
  console.log("Instructor: instructor@skillsync.ai / DEMO_INSTRUCTOR_PASSWORD");
  console.log("Admin: admin@skillsync.ai / DEMO_ADMIN_PASSWORD");
  console.log(`Primary enrollment id: ${firstEnrollment.id}`);
  console.log(`Sample course id: ${firstCourse.id}`);
  console.log(`Sample assignment id: ${firstCourse.assignments[0]!.id}`);
  console.log(`Sample submission id: ${submission.id}`);
};

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
