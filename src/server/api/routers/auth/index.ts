import { createTRPCRouter, publicProcedure } from "../../trpc";

/**
 * Auth router
 *
 * Handles authentication-related procedures
 */
export const authRouter = createTRPCRouter({
  /**
   * Get current user (public procedure)
   * Returns the current logged-in user if exists, otherwise returns null
   */
  getCurrentUser: publicProcedure.query(({ ctx }) => {
    return {
      user: ctx.user,
      isAuthenticated: !!ctx.user,
    };
  }),
});
