import { checkAuth } from "@/common/middlewares/checkAuth.js";

export const authGuard = checkAuth();
