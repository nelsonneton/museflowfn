import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const artists = pgTable("artists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  genre: text("genre").notNull(),
  platform: text("platform").notNull(),
  followers: integer("followers").notNull().default(0),
  ecvDna: json("ecv_dna").$type<{ energy: number; creativity: number; vibe: number }>(),
  dna: json("dna").$type<Record<string, any>>(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const realityNodes = pgTable("reality_nodes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  artistId: varchar("artist_id").notNull().references(() => artists.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  attributes: json("attributes").$type<Record<string, any>>(),
  position: json("position").$type<{ x: number; y: number }>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const realityRelationships = pgTable("reality_relationships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromNodeId: varchar("from_node_id").notNull().references(() => realityNodes.id, { onDelete: "cascade" }),
  toNodeId: varchar("to_node_id").notNull().references(() => realityNodes.id, { onDelete: "cascade" }),
  relationshipType: text("relationship_type").notNull(),
  strength: integer("strength").notNull().default(5),
});

export const timelineEvents = pgTable("timeline_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  artistId: varchar("artist_id").notNull().references(() => artists.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  eventDate: timestamp("event_date").notNull(),
  type: text("type").notNull().default("evento"),
  relatedNodes: json("related_nodes").$type<string[]>().default(sql`'[]'::json`),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  artistId: varchar("artist_id").notNull().references(() => artists.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("planning"),
  priority: text("priority").notNull().default("medium"),
  dueDate: timestamp("due_date"),
  assignee: text("assignee"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const calendarSlots = pgTable("calendar_slots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  artistId: varchar("artist_id").notNull().references(() => artists.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  contentType: text("content_type").notNull(),
  status: text("status").notNull().default("Planejado"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  brief: text("brief"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const marketplaceListings = pgTable("marketplace_listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  artistId: varchar("artist_id").notNull().references(() => artists.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  type: text("type").notNull(),
  price: integer("price").notNull(),
  duration: text("duration"),
  views: integer("views").notNull().default(0),
  imageUrl: text("image_url"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const curatedImages = pgTable("curated_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  artistId: varchar("artist_id").notNull().references(() => artists.id, { onDelete: "cascade" }),
  projectId: varchar("project_id").references(() => projects.id, { onDelete: "set null" }),
  imageUrl: text("image_url").notNull(),
  prompt: text("prompt"),
  rating: integer("rating").notNull().default(0),
  tags: json("tags").$type<string[]>().default(sql`'[]'::json`),
  approved: integer("approved").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const consistencyAlerts = pgTable("consistency_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  artistId: varchar("artist_id").notNull().references(() => artists.id, { onDelete: "cascade" }),
  severity: text("severity").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  affectedNodes: json("affected_nodes").$type<string[]>().default(sql`'[]'::json`),
  resolved: integer("resolved").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const realityArchetypes = pgTable("reality_archetypes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  entityType: text("entity_type").notNull(),
  description: text("description"),
  icon: text("icon"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertArtistSchema = createInsertSchema(artists).omit({
  id: true,
  createdAt: true,
});

export const insertRealityNodeSchema = createInsertSchema(realityNodes).omit({
  id: true,
  createdAt: true,
});

export const insertRealityRelationshipSchema = createInsertSchema(realityRelationships).omit({
  id: true,
});

export const insertTimelineEventSchema = createInsertSchema(timelineEvents).omit({
  id: true,
  createdAt: true,
}).extend({
  eventDate: z.coerce.date(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCalendarSlotSchema = createInsertSchema(calendarSlots).omit({
  id: true,
  createdAt: true,
}).extend({
  scheduledAt: z.coerce.date(),
  status: z.enum(["Planejado", "Em Produção", "Publicado", "Cancelado"]),
});

export const insertMarketplaceListingSchema = createInsertSchema(marketplaceListings).omit({
  id: true,
  createdAt: true,
});

export const insertCuratedImageSchema = createInsertSchema(curatedImages).omit({
  id: true,
  createdAt: true,
});

export const insertConsistencyAlertSchema = createInsertSchema(consistencyAlerts).omit({
  id: true,
  createdAt: true,
});

export const insertRealityArchetypeSchema = createInsertSchema(realityArchetypes).omit({
  id: true,
  createdAt: true,
}).extend({
  entityType: z.enum(['location', 'character', 'possession', 'concept']),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertArtist = z.infer<typeof insertArtistSchema>;
export type Artist = typeof artists.$inferSelect;

export type InsertRealityNode = z.infer<typeof insertRealityNodeSchema>;
export type RealityNode = typeof realityNodes.$inferSelect;

export type InsertRealityRelationship = z.infer<typeof insertRealityRelationshipSchema>;
export type RealityRelationship = typeof realityRelationships.$inferSelect;

export type InsertTimelineEvent = z.infer<typeof insertTimelineEventSchema>;
export type TimelineEvent = typeof timelineEvents.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertCalendarSlot = z.infer<typeof insertCalendarSlotSchema>;
export type CalendarSlot = typeof calendarSlots.$inferSelect;

export type InsertMarketplaceListing = z.infer<typeof insertMarketplaceListingSchema>;
export type MarketplaceListing = typeof marketplaceListings.$inferSelect;

export type InsertCuratedImage = z.infer<typeof insertCuratedImageSchema>;
export type CuratedImage = typeof curatedImages.$inferSelect;

export type InsertConsistencyAlert = z.infer<typeof insertConsistencyAlertSchema>;
export type ConsistencyAlert = typeof consistencyAlerts.$inferSelect;

export type InsertRealityArchetype = z.infer<typeof insertRealityArchetypeSchema>;
export type RealityArchetype = typeof realityArchetypes.$inferSelect;
