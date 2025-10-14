import { db } from "../server/db";
import { artists, realityNodes, realityRelationships, timelineEvents, projects, calendarSlots, marketplaceListings, curatedImages, consistencyAlerts } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  const artistData = [
    {
      name: "Luna Rivera",
      genre: "Electronic",
      platform: "Instagram",
      followers: 125000,
      ecvDna: { energy: 85, creativity: 92, vibe: 78 },
      status: "active"
    },
    {
      name: "DJ Nexus",
      genre: "Tech House",
      platform: "TikTok",
      followers: 280000,
      ecvDna: { energy: 95, creativity: 88, vibe: 90 },
      status: "active"
    },
    {
      name: "Echo Waves",
      genre: "Ambient",
      platform: "YouTube",
      followers: 450000,
      ecvDna: { energy: 70, creativity: 96, vibe: 85 },
      status: "active"
    }
  ];

  const createdArtists = await db.insert(artists).values(artistData).returning();
  console.log(`Created ${createdArtists.length} artists`);

  const lunaId = createdArtists[0].id;
  const djNexusId = createdArtists[1].id;
  const echoId = createdArtists[2].id;

  const nodeData = [
    { artistId: lunaId, type: "character", name: "Luna Stage Persona", description: "Main performance character with neon aesthetic", attributes: { appearance: "neon hair, futuristic outfit" }, position: { x: 100, y: 100 } },
    { artistId: lunaId, type: "location", name: "Downtown LA Studio", description: "Recording and production space", attributes: { vibe: "industrial-chic" }, position: { x: 200, y: 150 } },
    { artistId: lunaId, type: "possession", name: "Custom Synthesizer", description: "Signature instrument", attributes: { brand: "Moog" }, position: { x: 150, y: 200 } },
    { artistId: djNexusId, type: "character", name: "DJ Nexus", description: "Cyberpunk DJ persona", attributes: { style: "tech-noir" }, position: { x: 300, y: 100 } },
    { artistId: djNexusId, type: "location", name: "Berlin Underground Club", description: "Signature venue", attributes: { capacity: 500 }, position: { x: 400, y: 150 } },
  ];

  const createdNodes = await db.insert(realityNodes).values(nodeData).returning();
  console.log(`Created ${createdNodes.length} reality nodes`);

  if (createdNodes.length >= 3) {
    await db.insert(realityRelationships).values([
      { fromNodeId: createdNodes[0].id, toNodeId: createdNodes[1].id, relationshipType: "performs_at", strength: 9 },
      { fromNodeId: createdNodes[0].id, toNodeId: createdNodes[2].id, relationshipType: "uses", strength: 10 }
    ]);
    console.log("Created relationships");
  }

  await db.insert(timelineEvents).values([
    { artistId: lunaId, title: "First Major Performance", description: "Breakthrough show at Coachella", eventDate: new Date("2024-04-15"), relatedNodes: [createdNodes[0]?.id || ""] },
    { artistId: djNexusId, title: "Album Release", description: "Debut album drop", eventDate: new Date("2024-06-01"), relatedNodes: [createdNodes[3]?.id || ""] }
  ]);
  console.log("Created timeline events");

  const projectData = [
    { artistId: lunaId, title: "Summer Vibes 2024", description: "Seasonal content campaign", status: "in_progress", priority: "high", dueDate: new Date("2024-08-01"), assignee: "Creative Team" },
    { artistId: djNexusId, title: "Neon Dreams", description: "Music video series", status: "review", priority: "high", dueDate: new Date("2024-07-15"), assignee: "Video Team" },
    { artistId: echoId, title: "Ambient Sessions", description: "Live stream series", status: "planning", priority: "medium", dueDate: new Date("2024-09-01"), assignee: "Production" }
  ];

  const createdProjects = await db.insert(projects).values(projectData).returning();
  console.log(`Created ${createdProjects.length} projects`);

  await db.insert(calendarSlots).values([
    { artistId: lunaId, projectId: createdProjects[0].id, dayOfWeek: "Mon", timeSlot: "Morning", label: "Instagram Reel", contentType: "Social", status: "approved" },
    { artistId: lunaId, projectId: createdProjects[0].id, dayOfWeek: "Wed", timeSlot: "Afternoon", label: "TikTok Dance", contentType: "Viral", status: "published" },
    { artistId: djNexusId, projectId: createdProjects[1].id, dayOfWeek: "Fri", timeSlot: "Night", label: "YouTube Short", contentType: "Teaser", status: "planned" }
  ]);
  console.log("Created calendar slots");

  await db.insert(marketplaceListings).values([
    { artistId: lunaId, title: "Instagram Content Package - Q1 2024", type: "social_media", price: 2500, duration: "3 months", views: 342, imageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop", status: "active" },
    { artistId: djNexusId, title: "Exclusive Brand Campaign Rights", type: "exclusive", price: 15000, views: 156, imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=300&fit=crop", status: "active" },
    { artistId: echoId, title: "TikTok Viral Challenge License", type: "advertising", price: 5000, duration: "6 months", views: 523, imageUrl: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=300&fit=crop", status: "sold" }
  ]);
  console.log("Created marketplace listings");

  await db.insert(curatedImages).values([
    { artistId: lunaId, projectId: createdProjects[0].id, imageUrl: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=600&h=600&fit=crop", prompt: "Cyberpunk neon cityscape", rating: 5, tags: ["neon", "cyberpunk", "city"], approved: 1 },
    { artistId: djNexusId, projectId: createdProjects[1].id, imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=600&fit=crop", prompt: "DJ performing at underground club", rating: 4, tags: ["dj", "club", "performance"], approved: 1 }
  ]);
  console.log("Created curated images");

  await db.insert(consistencyAlerts).values([
    { artistId: lunaId, severity: "medium", title: "Timeline Conflict", description: "Character appearance differs from established lore", affectedNodes: [createdNodes[0]?.id || ""], resolved: 0 },
    { artistId: djNexusId, severity: "high", title: "Location Mismatch", description: "Venue capacity inconsistent with previous events", affectedNodes: [createdNodes[4]?.id || ""], resolved: 0 }
  ]);
  console.log("Created consistency alerts");

  console.log("Seed complete!");
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
