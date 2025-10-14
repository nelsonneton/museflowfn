import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { generateLore, analyzeImageForDNA } from "./gemini";
import {
  insertArtistSchema,
  insertRealityNodeSchema,
  insertRealityRelationshipSchema,
  insertTimelineEventSchema,
  insertProjectSchema,
  insertCalendarSlotSchema,
  insertMarketplaceListingSchema,
  insertCuratedImageSchema,
  insertConsistencyAlertSchema,
  insertRealityArchetypeSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Configure multer for image uploads (memory storage)
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      // Accept images only
      if (!file.mimetype.startsWith('image/')) {
        cb(new Error('Only image files are allowed!'));
        return;
      }
      cb(null, true);
    },
  });
  
  // Artists routes
  app.get("/api/artists", async (req, res) => {
    const artists = await storage.getAllArtists();
    res.json(artists);
  });

  app.get("/api/artists/:id", async (req, res) => {
    const artist = await storage.getArtist(req.params.id);
    if (!artist) {
      return res.status(404).json({ error: "Artist not found" });
    }
    res.json(artist);
  });

  app.post("/api/artists", async (req, res) => {
    const result = insertArtistSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    const artist = await storage.createArtist(result.data);
    res.status(201).json(artist);
  });

  app.patch("/api/artists/:id", async (req, res) => {
    const result = insertArtistSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    const artist = await storage.updateArtist(req.params.id, result.data);
    if (!artist) {
      return res.status(404).json({ error: "Artist not found" });
    }
    res.json(artist);
  });

  app.delete("/api/artists/:id", async (req, res) => {
    await storage.deleteArtist(req.params.id);
    res.status(204).send();
  });

  // AI generation routes
  app.post("/api/ai/generate-lore", async (req, res) => {
    const { concept } = req.body;
    
    if (!concept) {
      return res.status(400).json({ error: "Concept is required" });
    }

    // Get Gemini API key from environment secrets
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      return res.status(400).json({ 
        error: "Gemini API key not configured in environment secrets." 
      });
    }

    try {
      const lore = await generateLore(concept, geminiApiKey);
      res.json({ lore });
    } catch (error) {
      console.error("Error generating lore:", error);
      res.status(500).json({ 
        error: "Failed to generate lore. Please check your API key and try again." 
      });
    }
  });

  // AI image analysis route for DNA extraction
  app.post("/api/ai/analyze-image", upload.single('image'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // Get Gemini API key from environment secrets
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      return res.status(400).json({ 
        error: "Gemini API key not configured in environment secrets." 
      });
    }

    try {
      const extractedDNA = await analyzeImageForDNA(
        req.file.buffer, 
        req.file.mimetype,
        geminiApiKey
      );
      res.json(extractedDNA);
    } catch (error) {
      console.error("Error analyzing image:", error);
      res.status(500).json({ 
        error: "Failed to analyze image. Please check your API key and try again." 
      });
    }
  });

  // Reality Nodes routes
  app.get("/api/reality-nodes", async (req, res) => {
    const artistId = req.query.artistId as string;
    if (!artistId) {
      return res.status(400).json({ error: "artistId query parameter required" });
    }
    const nodes = await storage.getAllRealityNodes(artistId);
    res.json(nodes);
  });

  app.post("/api/reality-nodes", async (req, res) => {
    const result = insertRealityNodeSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    const node = await storage.createRealityNode(result.data);
    res.status(201).json(node);
  });

  app.patch("/api/reality-nodes/:id", async (req, res) => {
    const result = insertRealityNodeSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    const node = await storage.updateRealityNode(req.params.id, result.data);
    if (!node) {
      return res.status(404).json({ error: "Node not found" });
    }
    res.json(node);
  });

  app.delete("/api/reality-nodes/:id", async (req, res) => {
    await storage.deleteRealityNode(req.params.id);
    res.status(204).send();
  });

  // Reality Relationships routes
  app.get("/api/reality-relationships", async (req, res) => {
    const relationships = await storage.getAllRelationships();
    res.json(relationships);
  });

  app.post("/api/reality-relationships", async (req, res) => {
    const result = insertRealityRelationshipSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    const relationship = await storage.createRelationship(result.data);
    res.status(201).json(relationship);
  });

  app.delete("/api/reality-relationships/:id", async (req, res) => {
    await storage.deleteRelationship(req.params.id);
    res.status(204).send();
  });

  // Timeline Events routes
  app.get("/api/timeline-events", async (req, res) => {
    const artistId = req.query.artistId as string;
    if (!artistId) {
      return res.status(400).json({ error: "artistId query parameter required" });
    }
    const events = await storage.getAllTimelineEvents(artistId);
    res.json(events);
  });

  app.post("/api/timeline-events", async (req, res) => {
    const result = insertTimelineEventSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    const event = await storage.createTimelineEvent(result.data);
    res.status(201).json(event);
  });

  app.patch("/api/timeline-events/:id", async (req, res) => {
    const result = insertTimelineEventSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    const event = await storage.updateTimelineEvent(req.params.id, result.data);
    if (!event) {
      return res.status(404).json({ error: "Timeline event not found" });
    }
    res.json(event);
  });

  app.delete("/api/timeline-events/:id", async (req, res) => {
    await storage.deleteTimelineEvent(req.params.id);
    res.status(204).send();
  });

  // Projects routes
  app.get("/api/projects", async (req, res) => {
    const artistId = req.query.artistId as string | undefined;
    const projects = await storage.getAllProjects(artistId);
    res.json(projects);
  });

  app.get("/api/projects/:id", async (req, res) => {
    const project = await storage.getProject(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json(project);
  });

  app.post("/api/projects", async (req, res) => {
    const result = insertProjectSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    const project = await storage.createProject(result.data);
    res.status(201).json(project);
  });

  app.patch("/api/projects/:id", async (req, res) => {
    const result = insertProjectSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    const project = await storage.updateProject(req.params.id, result.data);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json(project);
  });

  app.delete("/api/projects/:id", async (req, res) => {
    await storage.deleteProject(req.params.id);
    res.status(204).send();
  });

  // Calendar Slots routes
  app.get("/api/calendar-slots", async (req, res) => {
    const artistId = req.query.artistId as string;
    const dateStart = req.query.dateStart as string | undefined;
    const dateEnd = req.query.dateEnd as string | undefined;
    
    if (!artistId) {
      return res.status(400).json({ error: "artistId query parameter required" });
    }
    
    const slots = await storage.getAllCalendarSlots(artistId, dateStart, dateEnd);
    res.json(slots);
  });

  app.post("/api/calendar-slots", async (req, res) => {
    const result = insertCalendarSlotSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    const slot = await storage.createCalendarSlot(result.data);
    res.status(201).json(slot);
  });

  app.patch("/api/calendar-slots/:id", async (req, res) => {
    const result = insertCalendarSlotSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    const slot = await storage.updateCalendarSlot(req.params.id, result.data);
    if (!slot) {
      return res.status(404).json({ error: "Slot not found" });
    }
    res.json(slot);
  });

  app.delete("/api/calendar-slots/:id", async (req, res) => {
    await storage.deleteCalendarSlot(req.params.id);
    res.status(204).send();
  });

  // Marketplace Listings routes
  app.get("/api/marketplace-listings", async (req, res) => {
    const artistId = req.query.artistId as string | undefined;
    const listings = await storage.getAllMarketplaceListings(artistId);
    res.json(listings);
  });

  app.get("/api/marketplace-listings/:id", async (req, res) => {
    const listing = await storage.getMarketplaceListing(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }
    res.json(listing);
  });

  app.post("/api/marketplace-listings", async (req, res) => {
    const result = insertMarketplaceListingSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    const listing = await storage.createMarketplaceListing(result.data);
    res.status(201).json(listing);
  });

  app.patch("/api/marketplace-listings/:id", async (req, res) => {
    const result = insertMarketplaceListingSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    const listing = await storage.updateMarketplaceListing(req.params.id, result.data);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }
    res.json(listing);
  });

  app.delete("/api/marketplace-listings/:id", async (req, res) => {
    await storage.deleteMarketplaceListing(req.params.id);
    res.status(204).send();
  });

  // Curated Images routes
  app.get("/api/curated-images", async (req, res) => {
    const artistId = req.query.artistId as string;
    if (!artistId) {
      return res.status(400).json({ error: "artistId query parameter required" });
    }
    const images = await storage.getAllCuratedImages(artistId);
    res.json(images);
  });

  app.post("/api/curated-images", async (req, res) => {
    const result = insertCuratedImageSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    const image = await storage.createCuratedImage(result.data);
    res.status(201).json(image);
  });

  app.patch("/api/curated-images/:id", async (req, res) => {
    const result = insertCuratedImageSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    const image = await storage.updateCuratedImage(req.params.id, result.data);
    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }
    res.json(image);
  });

  app.delete("/api/curated-images/:id", async (req, res) => {
    await storage.deleteCuratedImage(req.params.id);
    res.status(204).send();
  });

  // Consistency Alerts routes
  app.get("/api/consistency-alerts", async (req, res) => {
    const artistId = req.query.artistId as string;
    if (!artistId) {
      return res.status(400).json({ error: "artistId query parameter required" });
    }
    const alerts = await storage.getAllConsistencyAlerts(artistId);
    res.json(alerts);
  });

  app.post("/api/consistency-alerts", async (req, res) => {
    const result = insertConsistencyAlertSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    const alert = await storage.createConsistencyAlert(result.data);
    res.status(201).json(alert);
  });

  app.patch("/api/consistency-alerts/:id", async (req, res) => {
    const result = insertConsistencyAlertSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    const alert = await storage.updateConsistencyAlert(req.params.id, result.data);
    if (!alert) {
      return res.status(404).json({ error: "Alert not found" });
    }
    res.json(alert);
  });

  app.delete("/api/consistency-alerts/:id", async (req, res) => {
    await storage.deleteConsistencyAlert(req.params.id);
    res.status(204).send();
  });

  // Reality Archetypes routes (admin)
  app.get("/api/admin/archetypes", async (req, res) => {
    const archetypes = await storage.getAllRealityArchetypes();
    res.json(archetypes);
  });

  app.get("/api/admin/archetypes/:id", async (req, res) => {
    const archetype = await storage.getRealityArchetype(req.params.id);
    if (!archetype) {
      return res.status(404).json({ error: "Archetype not found" });
    }
    res.json(archetype);
  });

  app.post("/api/admin/archetypes", async (req, res) => {
    const result = insertRealityArchetypeSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    const archetype = await storage.createRealityArchetype(result.data);
    res.status(201).json(archetype);
  });

  app.patch("/api/admin/archetypes/:id", async (req, res) => {
    const result = insertRealityArchetypeSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    const archetype = await storage.updateRealityArchetype(req.params.id, result.data);
    if (!archetype) {
      return res.status(404).json({ error: "Archetype not found" });
    }
    res.json(archetype);
  });

  app.delete("/api/admin/archetypes/:id", async (req, res) => {
    await storage.deleteRealityArchetype(req.params.id);
    res.status(204).send();
  });

  const httpServer = createServer(app);

  return httpServer;
}
