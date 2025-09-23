import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const subscriptions = defineTable({
  userId: v.id("users"),
  polarCustomerId: v.string(),
  polarSubscriptionId: v.string(),
  productId: v.optional(v.string()),
  priceId: v.optional(v.string()),
  planCode: v.optional(v.string()),
  status: v.string(),
  currentPeriodEnd: v.optional(v.number()),
  trialEndsAt: v.optional(v.number()),
  cancelAt: v.optional(v.number()),
  canceledAt: v.optional(v.number()),
  seats: v.optional(v.number()),
  metadata: v.optional(v.any()),
  creditBalance: v.number(),
  creditsGrantPerPeriod: v.number(),
  creditRolloverLimit: v.number(),
  lastGrantCursor: v.optional(v.string()),
})
  .index("by_userId", ["userId"])
  .index("by_polarSubscriptionId", ["polarSubscriptionId"])
  .index("by_status", ["status"]);

const credits_ledger = defineTable({
  userId: v.id("users"),
  subscriptionId: v.id("subscriptions"),
  amount: v.number(),
  type: v.string(), // grant | consume | adjust
  reason: v.optional(v.string()),
  idempotencyKey: v.optional(v.string()),
  meta: v.optional(v.any()),
})
  .index("by_subscriptionId", ["subscriptionId"])
  .index("by_userId", ["userId"])
  .index("by_idempotencyKey", ["idempotencyKey"]);

const projects = defineTable({
  userId: v.id("users"),
  name: v.string(),
  description: v.optional(v.string()),
  styleGuide: v.optional(v.string()),
  sketchesData: v.any(),
  viewportData: v.optional(v.any()),
  generatedDesignData: v.optional(v.any()),
  thumbnail: v.optional(v.string()),
  moodBoardImages: v.optional(v.array(v.string())),
  inspirationImages: v.optional(v.array(v.string())),
  lastModified: v.number(),
  createdAt: v.number(),
  isPublic: v.optional(v.boolean()),
  tags: v.optional(v.array(v.string())),
  projectNumber: v.number(),
}).index("by_userId", ["userId"]);

const project_counters = defineTable({
  userId: v.id("users"),
  nextProjectNumber: v.number(),
}).index("by_userId", ["userId"]);

const schema = defineSchema({
  ...authTables,
  subscriptions,
  credits_ledger,
  projects,
  project_counters,
});

export default schema;
