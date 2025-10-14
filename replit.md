# Artist Muse Flow

## Overview

Artist Muse Flow is a SaaS platform designed to streamline artist narrative management, content creation, and multi-platform publishing. It features a Reality Engine for maintaining narrative consistency across various elements like locations, characters, possessions, and concepts. The platform also provides tools for content planning, AI-generated creative assets, and marketplace licensing. It aims to serve independent artists, talent agencies, and content producers by offering a robust solution for managing complex creative workflows and ensuring brand consistency across social media.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:** React 18+ with TypeScript, Vite as the build tool, and Wouter for client-side routing. TanStack Query manages server state.

**UI Component System:** Shadcn/ui (New York style) built on Radix UI primitives, styled with Tailwind CSS, and Class Variance Authority (CVA) for component variants. The design is dark-mode-first with light mode support.

**Design Philosophy:** Information-dense, utility-focused interface inspired by platforms like Linear and Notion, utilizing a custom HSL-based color palette and a clear typography hierarchy (Inter and JetBrains Mono).

**State Management:** React Query for asynchronous server state with caching and invalidation, React Context for global artist selection (ArtistContext) with localStorage persistence, React Context for theme management (ThemeProvider), and local component state for UI interactions.

### Backend Architecture

**Server Framework:** Express.js with TypeScript. Shared type definitions ensure consistency between client and server.

**API Design:** RESTful API with JSON format for requests/responses, Zod for runtime validation (via drizzle-zod), and comprehensive error handling.

**Database Layer:** Drizzle ORM for type-safe operations with PostgreSQL (Neon serverless). A schema-first approach is used with migrations.

**Data Models:**
- **Artists**: Core entity with genre, platform, followers, and a detailed `dna` JSON field for characteristics.
- **Reality Nodes**: Graph-based system for locations, characters, possessions, and concepts.
- **Reality Relationships**: Connections between nodes.
- **Reality Archetypes**: Reusable templates for creating common entities with predefined characteristics. Includes name, entityType (location, character, possession, concept), description, and icon. Accessible via admin panel at `/archetypes`.
- **Timeline Events**: Chronological narrative events linked to reality nodes.
- **Projects**: Content projects.
- **Calendar Slots**: Scheduled content.
- **Marketplace Listings**: Content licensing.
- **Curated Images**: AI-generated images.
- **Consistency Alerts**: Narrative inconsistency detection.

### Authentication & Authorization

A basic user model with username/password is in place. Planned features include session-based authentication using `connect-pg-simple`, JWT tokens, and an RBAC system for admin, manager, and brand roles with artist-scoped permissions for multi-tenancy.

### Development Workflow

**Environment Setup:** Vite for client development, esbuild for server bundling, and TypeScript for type checking.

**Database Management:** Drizzle Kit for schema migrations and `npm run db:push` for applying changes. A seed script is used for development data.

**Code Organization:** The project is structured into `/client` (React frontend), `/server` (Express backend), and `/shared` (common type definitions and schemas).

## External Dependencies

### Core Infrastructure

**Database:** Neon Serverless PostgreSQL, utilizing `@neondatabase/serverless` for connection pooling.

**ORM & Validation:** Drizzle ORM, Drizzle Zod, and Zod for robust data management and validation.

### UI & Component Libraries

**Design System:** Radix UI for accessible components, Shadcn/ui for pre-built patterns, and Tailwind CSS for styling.

**Icons:** Lucide React and React Icons.

**Utilities:** `date-fns` for date manipulation, `clsx` and `tailwind-merge` for class management, and `class-variance-authority` for component variations.

### AI Services

- Google Gemini AI (`@google/genai`) for AI-powered lore generation and image analysis (DNA extraction from images).

### Development Tools

**Build & Dev:** Vite, Replit-specific plugins, esbuild, and PostCSS with Autoprefixer.

**Type Safety:** TypeScript, shared type definitions, and React Hook Form with Zod resolvers.

### Planned Integrations

**AI Services:** OpenAI API for content and image generation, and text generation.

**Social Media Platforms:** Instagram, TikTok, YouTube, and Spotify APIs for content publishing and management.

**Analytics & Monitoring:** Platform-specific analytics, real-time consistency checks, and content performance tracking.

**Session Management:** PostgreSQL session store via `connect-pg-simple`.