import { AssignmentStatus, SubmissionStatus, TicketStatus, UserRole } from "@prisma/client";

import { prisma } from "../../config/prisma.js";

const monthKey = (date: Date) => date.toISOString().slice(0, 7);

const groupByMonth = (items: { createdAt: Date }[]) => {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(monthKey(item.createdAt), (counts.get(monthKey(item.createdAt)) ?? 0) + 1);
  return [...counts.entries()].map(([month, total]) => ({ month, total }));
};

const getStudentDashboard = async (userId: string) => {
  const [enrollments, pendingAssignments, submittedAssignments, submissions, submissionStats] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId },
      select: {
        progress: true,
        createdAt: true,
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            category: { select: { id: true, name: true, slug: true } },
            instructor: { select: { id: true, name: true, email: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.assignment.count({
      where: {
        status: AssignmentStatus.ACTIVE,
        course: { enrollments: { some: { userId } } },
        submissions: { none: { studentId: userId } },
      },
    }),
    prisma.submission.count({ where: { studentId: userId } }),
    prisma.submission.findMany({
      where: { studentId: userId },
      select: {
        id: true,
        status: true,
        createdAt: true,
        assignment: { select: { id: true, title: true, course: { select: { id: true, title: true, slug: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.submission.groupBy({ by: ["status"], where: { studentId: userId }, _count: { status: true } }),
  ]);

  const totalEnrolledCourses = await prisma.enrollment.count({ where: { userId } });
  const averageProgress =
    totalEnrolledCourses > 0
      ? Math.round(enrollments.reduce((sum, item) => sum + item.progress, 0) / enrollments.length)
      : 0;

  return {
    totalEnrolledCourses,
    averageProgress,
    pendingAssignments,
    submittedAssignments,
    recentClasses: enrollments,
    recentSubmissions: submissions,
    assignmentStatusStats: submissionStats.map((item) => ({ status: item.status, total: item._count.status })),
    progressChart: enrollments.map((item) => ({ courseId: item.course.id, title: item.course.title, progress: item.progress })),
  };
};

const getInstructorDashboard = async (userId: string) => {
  const [courses, pendingReviews, ratingAggregate, assignmentSubmissionStats] = await Promise.all([
    prisma.course.findMany({
      where: { instructorId: userId },
      select: { id: true, title: true, totalEnrollments: true, averageRating: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.submission.count({
      where: { status: SubmissionStatus.PENDING, assignment: { course: { instructorId: userId } } },
    }),
    prisma.course.aggregate({ where: { instructorId: userId }, _avg: { averageRating: true } }),
    prisma.assignment.findMany({
      where: { course: { instructorId: userId } },
      select: { id: true, title: true, _count: { select: { submissions: true } }, course: { select: { id: true, title: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);
  const courseIds = courses.map((course) => course.id);
  const totalStudents = courseIds.length
    ? await prisma.enrollment.count({ where: { courseId: { in: courseIds } } })
    : 0;

  return {
    totalCourses: courses.length,
    totalStudents,
    pendingReviews,
    averageCourseRating: Number((ratingAggregate._avg.averageRating ?? 0).toFixed(2)),
    courseEnrollmentStats: courses.map((course) => ({ courseId: course.id, title: course.title, totalEnrollments: course.totalEnrollments })),
    assignmentSubmissionStats: assignmentSubmissionStats.map((assignment) => ({
      assignmentId: assignment.id,
      title: assignment.title,
      course: assignment.course,
      totalSubmissions: assignment._count.submissions,
    })),
  };
};

const getAdminDashboard = async () => {
  const [totalUsers, totalStudents, totalInstructors, totalCourses, totalEnrollments, totalBlogs, openTickets, totalAiRequests, users, categoryDistribution, ticketStats, aiStats] = await Promise.all([
    prisma.user.count({ where: { isDeleted: false } }),
    prisma.user.count({ where: { role: UserRole.STUDENT, isDeleted: false } }),
    prisma.user.count({ where: { role: UserRole.INSTRUCTOR, isDeleted: false } }),
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.blog.count(),
    prisma.supportTicket.count({ where: { status: TicketStatus.OPEN } }),
    prisma.aiRequestLog.count(),
    prisma.user.findMany({ select: { createdAt: true }, orderBy: { createdAt: "asc" } }),
    prisma.category.findMany({ select: { id: true, name: true, _count: { select: { courses: true } } } }),
    prisma.supportTicket.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.aiRequestLog.groupBy({ by: ["feature"], _count: { feature: true } }),
  ]);

  return {
    totalUsers,
    totalStudents,
    totalInstructors,
    totalCourses,
    totalEnrollments,
    totalBlogs,
    openTickets,
    totalAiRequests,
    monthlyUserGrowth: groupByMonth(users),
    courseCategoryDistribution: categoryDistribution.map((category) => ({ categoryId: category.id, name: category.name, totalCourses: category._count.courses })),
    ticketStatusStats: ticketStats.map((item) => ({ status: item.status, total: item._count.status })),
    aiUsageStats: aiStats.map((item) => ({ feature: item.feature, total: item._count.feature })),
  };
};

export const dashboardService = { getStudentDashboard, getInstructorDashboard, getAdminDashboard };
