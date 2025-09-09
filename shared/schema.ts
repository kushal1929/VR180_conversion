import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const videos = pgTable("videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  originalFilename: text("original_filename").notNull(),
  originalPath: text("original_path").notNull(),
  vrPath: text("vr_path"),
  mobileVrPath: text("mobile_vr_path"),
  status: text("status").notNull().default("uploaded"), // uploaded, processing, completed, failed
  progress: integer("progress").default(0),
  fileSize: integer("file_size").notNull(),
  duration: integer("duration"), // in seconds
  resolution: text("resolution"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const processingSteps = pgTable("processing_steps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  videoId: varchar("video_id").references(() => videos.id).notNull(),
  stepName: text("step_name").notNull(), // depth_analysis, stereoscopic_generation, quality_enhancement, final_rendering
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  progress: integer("progress").default(0),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  errorMessage: text("error_message"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertVideoSchema = createInsertSchema(videos).pick({
  originalFilename: true,
  originalPath: true,
  fileSize: true,
  duration: true,
  resolution: true,
});

export const insertProcessingStepSchema = createInsertSchema(processingSteps).pick({
  videoId: true,
  stepName: true,
  status: true,
  progress: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videos.$inferSelect;
export type InsertProcessingStep = z.infer<typeof insertProcessingStepSchema>;
export type ProcessingStep = typeof processingSteps.$inferSelect;
