import { v } from "convex/values";
import { query } from "./_generated/server";

export const hasEntitlement = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const now = Date.now();

    const subs = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    return subs.some((sub) => {
      const status = String(sub.status || "").toLowerCase();
      const validPeriod = !sub.currentPeriodEnd || sub.currentPeriodEnd > now;

      if (status === "active" && validPeriod) {
        return true;
      }

      return false;
    });
  },
});
