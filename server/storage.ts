import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import {
  type User, type InsertUser,
  type Artist, type InsertArtist,
  type RealityNode, type InsertRealityNode,
  type RealityRelationship, type InsertRealityRelationship,
  type TimelineEvent, type InsertTimelineEvent,
  type Project, type InsertProject,
  type CalendarSlot, type InsertCalendarSlot,
  type MarketplaceListing, type InsertMarketplaceListing,
  type CuratedImage, type InsertCuratedImage,
  type ConsistencyAlert, type InsertConsistencyAlert,
  type RealityArchetype, type InsertRealityArchetype,
  users, artists, realityNodes, realityRelationships, timelineEvents,
  projects, calendarSlots, marketplaceListings, curatedImages, consistencyAlerts, realityArchetypes
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllArtists(): Promise<Artist[]>;
  getArtist(id: string): Promise<Artist | undefined>;
  createArtist(artist: InsertArtist): Promise<Artist>;
  updateArtist(id: string, artist: Partial<InsertArtist>): Promise<Artist | undefined>;
  deleteArtist(id: string): Promise<void>;
  
  getAllRealityNodes(artistId: string): Promise<RealityNode[]>;
  getRealityNode(id: string): Promise<RealityNode | undefined>;
  createRealityNode(node: InsertRealityNode): Promise<RealityNode>;
  updateRealityNode(id: string, node: Partial<InsertRealityNode>): Promise<RealityNode | undefined>;
  deleteRealityNode(id: string): Promise<void>;
  
  getAllRelationships(): Promise<RealityRelationship[]>;
  createRelationship(relationship: InsertRealityRelationship): Promise<RealityRelationship>;
  deleteRelationship(id: string): Promise<void>;
  
  getAllTimelineEvents(artistId: string): Promise<TimelineEvent[]>;
  createTimelineEvent(event: InsertTimelineEvent): Promise<TimelineEvent>;
  updateTimelineEvent(id: string, event: Partial<InsertTimelineEvent>): Promise<TimelineEvent | undefined>;
  deleteTimelineEvent(id: string): Promise<void>;
  
  getAllProjects(artistId?: string): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<void>;
  
  getAllCalendarSlots(artistId: string, dateStart?: string, dateEnd?: string): Promise<CalendarSlot[]>;
  createCalendarSlot(slot: InsertCalendarSlot): Promise<CalendarSlot>;
  updateCalendarSlot(id: string, slot: Partial<InsertCalendarSlot>): Promise<CalendarSlot | undefined>;
  deleteCalendarSlot(id: string): Promise<void>;
  
  getAllMarketplaceListings(artistId?: string): Promise<MarketplaceListing[]>;
  getMarketplaceListing(id: string): Promise<MarketplaceListing | undefined>;
  createMarketplaceListing(listing: InsertMarketplaceListing): Promise<MarketplaceListing>;
  updateMarketplaceListing(id: string, listing: Partial<InsertMarketplaceListing>): Promise<MarketplaceListing | undefined>;
  deleteMarketplaceListing(id: string): Promise<void>;
  
  getAllCuratedImages(artistId: string): Promise<CuratedImage[]>;
  createCuratedImage(image: InsertCuratedImage): Promise<CuratedImage>;
  updateCuratedImage(id: string, image: Partial<InsertCuratedImage>): Promise<CuratedImage | undefined>;
  deleteCuratedImage(id: string): Promise<void>;
  
  getAllConsistencyAlerts(artistId: string): Promise<ConsistencyAlert[]>;
  createConsistencyAlert(alert: InsertConsistencyAlert): Promise<ConsistencyAlert>;
  updateConsistencyAlert(id: string, alert: Partial<InsertConsistencyAlert>): Promise<ConsistencyAlert | undefined>;
  deleteConsistencyAlert(id: string): Promise<void>;
  
  getAllRealityArchetypes(): Promise<RealityArchetype[]>;
  getRealityArchetype(id: string): Promise<RealityArchetype | undefined>;
  createRealityArchetype(archetype: InsertRealityArchetype): Promise<RealityArchetype>;
  updateRealityArchetype(id: string, archetype: Partial<InsertRealityArchetype>): Promise<RealityArchetype | undefined>;
  deleteRealityArchetype(id: string): Promise<void>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getAllArtists(): Promise<Artist[]> {
    return db.select().from(artists).orderBy(desc(artists.createdAt));
  }

  async getArtist(id: string): Promise<Artist | undefined> {
    const result = await db.select().from(artists).where(eq(artists.id, id)).limit(1);
    return result[0];
  }

  async createArtist(artist: InsertArtist): Promise<Artist> {
    const result = await db.insert(artists).values(artist).returning();
    return result[0];
  }

  async updateArtist(id: string, artist: Partial<InsertArtist>): Promise<Artist | undefined> {
    const result = await db.update(artists).set(artist).where(eq(artists.id, id)).returning();
    return result[0];
  }

  async deleteArtist(id: string): Promise<void> {
    await db.delete(artists).where(eq(artists.id, id));
  }

  async getAllRealityNodes(artistId: string): Promise<RealityNode[]> {
    return db.select().from(realityNodes).where(eq(realityNodes.artistId, artistId)).orderBy(desc(realityNodes.createdAt));
  }

  async getRealityNode(id: string): Promise<RealityNode | undefined> {
    const result = await db.select().from(realityNodes).where(eq(realityNodes.id, id)).limit(1);
    return result[0];
  }

  async createRealityNode(node: InsertRealityNode): Promise<RealityNode> {
    const result = await db.insert(realityNodes).values(node).returning();
    return result[0];
  }

  async updateRealityNode(id: string, node: Partial<InsertRealityNode>): Promise<RealityNode | undefined> {
    const result = await db.update(realityNodes).set(node).where(eq(realityNodes.id, id)).returning();
    return result[0];
  }

  async deleteRealityNode(id: string): Promise<void> {
    await db.delete(realityNodes).where(eq(realityNodes.id, id));
  }

  async getAllRelationships(): Promise<RealityRelationship[]> {
    return db.select().from(realityRelationships);
  }

  async createRelationship(relationship: InsertRealityRelationship): Promise<RealityRelationship> {
    const result = await db.insert(realityRelationships).values(relationship).returning();
    return result[0];
  }

  async deleteRelationship(id: string): Promise<void> {
    await db.delete(realityRelationships).where(eq(realityRelationships.id, id));
  }

  async getAllTimelineEvents(artistId: string): Promise<TimelineEvent[]> {
    return db.select().from(timelineEvents).where(eq(timelineEvents.artistId, artistId)).orderBy(desc(timelineEvents.eventDate));
  }

  async createTimelineEvent(event: InsertTimelineEvent): Promise<TimelineEvent> {
    const eventData: any = { ...event };
    const result = await db.insert(timelineEvents).values(eventData).returning();
    return result[0];
  }

  async updateTimelineEvent(id: string, event: Partial<InsertTimelineEvent>): Promise<TimelineEvent | undefined> {
    const eventData: any = { ...event };
    const result = await db.update(timelineEvents).set(eventData).where(eq(timelineEvents.id, id)).returning();
    return result[0];
  }

  async deleteTimelineEvent(id: string): Promise<void> {
    await db.delete(timelineEvents).where(eq(timelineEvents.id, id));
  }

  async getAllProjects(artistId?: string): Promise<Project[]> {
    if (artistId) {
      return db.select().from(projects).where(eq(projects.artistId, artistId)).orderBy(desc(projects.createdAt));
    }
    return db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return result[0];
  }

  async createProject(project: InsertProject): Promise<Project> {
    const result = await db.insert(projects).values(project).returning();
    return result[0];
  }

  async updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined> {
    const result = await db.update(projects).set({ ...project, updatedAt: new Date() }).where(eq(projects.id, id)).returning();
    return result[0];
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  async getAllCalendarSlots(artistId: string, dateStart?: string, dateEnd?: string): Promise<CalendarSlot[]> {
    // Build conditions array
    const conditions: any[] = [eq(calendarSlots.artistId, artistId)];
    
    if (dateStart) {
      conditions.push(gte(calendarSlots.scheduledAt, new Date(dateStart)));
    }
    if (dateEnd) {
      conditions.push(lte(calendarSlots.scheduledAt, new Date(dateEnd)));
    }
    
    return db.select().from(calendarSlots).where(and(...conditions)).orderBy(calendarSlots.scheduledAt);
  }

  async createCalendarSlot(slot: InsertCalendarSlot): Promise<CalendarSlot> {
    const result = await db.insert(calendarSlots).values(slot).returning();
    return result[0];
  }

  async updateCalendarSlot(id: string, slot: Partial<InsertCalendarSlot>): Promise<CalendarSlot | undefined> {
    const result = await db.update(calendarSlots).set(slot).where(eq(calendarSlots.id, id)).returning();
    return result[0];
  }

  async deleteCalendarSlot(id: string): Promise<void> {
    await db.delete(calendarSlots).where(eq(calendarSlots.id, id));
  }

  async getAllMarketplaceListings(artistId?: string): Promise<MarketplaceListing[]> {
    if (artistId) {
      return db.select().from(marketplaceListings).where(eq(marketplaceListings.artistId, artistId)).orderBy(desc(marketplaceListings.createdAt));
    }
    return db.select().from(marketplaceListings).orderBy(desc(marketplaceListings.createdAt));
  }

  async getMarketplaceListing(id: string): Promise<MarketplaceListing | undefined> {
    const result = await db.select().from(marketplaceListings).where(eq(marketplaceListings.id, id)).limit(1);
    return result[0];
  }

  async createMarketplaceListing(listing: InsertMarketplaceListing): Promise<MarketplaceListing> {
    const result = await db.insert(marketplaceListings).values(listing).returning();
    return result[0];
  }

  async updateMarketplaceListing(id: string, listing: Partial<InsertMarketplaceListing>): Promise<MarketplaceListing | undefined> {
    const result = await db.update(marketplaceListings).set(listing).where(eq(marketplaceListings.id, id)).returning();
    return result[0];
  }

  async deleteMarketplaceListing(id: string): Promise<void> {
    await db.delete(marketplaceListings).where(eq(marketplaceListings.id, id));
  }

  async getAllCuratedImages(artistId: string): Promise<CuratedImage[]> {
    return db.select().from(curatedImages).where(eq(curatedImages.artistId, artistId)).orderBy(desc(curatedImages.createdAt));
  }

  async createCuratedImage(image: InsertCuratedImage): Promise<CuratedImage> {
    const imageData: any = { ...image };
    const result = await db.insert(curatedImages).values(imageData).returning();
    return result[0];
  }

  async updateCuratedImage(id: string, image: Partial<InsertCuratedImage>): Promise<CuratedImage | undefined> {
    const updateData: any = { ...image };
    const result = await db.update(curatedImages).set(updateData).where(eq(curatedImages.id, id)).returning();
    return result[0];
  }

  async deleteCuratedImage(id: string): Promise<void> {
    await db.delete(curatedImages).where(eq(curatedImages.id, id));
  }

  async getAllConsistencyAlerts(artistId: string): Promise<ConsistencyAlert[]> {
    return db.select().from(consistencyAlerts).where(eq(consistencyAlerts.artistId, artistId)).orderBy(desc(consistencyAlerts.createdAt));
  }

  async createConsistencyAlert(alert: InsertConsistencyAlert): Promise<ConsistencyAlert> {
    const alertData: any = { ...alert };
    const result = await db.insert(consistencyAlerts).values(alertData).returning();
    return result[0];
  }

  async updateConsistencyAlert(id: string, alert: Partial<InsertConsistencyAlert>): Promise<ConsistencyAlert | undefined> {
    const updateData: any = { ...alert };
    const result = await db.update(consistencyAlerts).set(updateData).where(eq(consistencyAlerts.id, id)).returning();
    return result[0];
  }

  async deleteConsistencyAlert(id: string): Promise<void> {
    await db.delete(consistencyAlerts).where(eq(consistencyAlerts.id, id));
  }

  async getAllRealityArchetypes(): Promise<RealityArchetype[]> {
    return db.select().from(realityArchetypes).orderBy(desc(realityArchetypes.createdAt));
  }

  async getRealityArchetype(id: string): Promise<RealityArchetype | undefined> {
    const result = await db.select().from(realityArchetypes).where(eq(realityArchetypes.id, id)).limit(1);
    return result[0];
  }

  async createRealityArchetype(archetype: InsertRealityArchetype): Promise<RealityArchetype> {
    const result = await db.insert(realityArchetypes).values(archetype).returning();
    return result[0];
  }

  async updateRealityArchetype(id: string, archetype: Partial<InsertRealityArchetype>): Promise<RealityArchetype | undefined> {
    const result = await db.update(realityArchetypes).set(archetype).where(eq(realityArchetypes.id, id)).returning();
    return result[0];
  }

  async deleteRealityArchetype(id: string): Promise<void> {
    await db.delete(realityArchetypes).where(eq(realityArchetypes.id, id));
  }
}

export const storage = new DbStorage();
