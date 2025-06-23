import { pgTable, uuid, varchar, text, timestamp, json, boolean } from "drizzle-orm/pg-core";

// Blogs table - matches your create blog page
export const blogs = pgTable("blogs", {
   id: uuid().primaryKey().defaultRandom(),
   title: varchar({ length: 255 }).notNull(),
   subtitle: varchar({ length: 500 }),
   content: text().notNull(),
   tags: json().$type<string[]>().default([]),
   status: varchar({ length: 20 }).default('draft'), 

   // Owner details (from Clerk)
   ownerName: varchar({ length: 255 }).notNull(),
   clerkId: varchar({ length: 255 }).notNull(),

   // Organization details (from Clerk)
   organizationId: varchar({ length: 255 }), 
   organizationName: varchar({ length: 255 }),

   // Publishing details
   isPublic: boolean().default(false),
   publishedAt: timestamp(),

   createdAt: timestamp().defaultNow(),
   updatedAt: timestamp().defaultNow(),
});