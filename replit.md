# VR180 Video Converter

## Overview

This is a full-stack web application that converts regular 2D videos into VR 180° format videos. The application provides an intuitive interface for users to upload videos, monitor AI-powered processing with real-time progress tracking, preview results, and download the converted VR videos. Built with React frontend and Node.js backend, it features a modern design using shadcn/ui components and handles large video file uploads with comprehensive error handling.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom color variables and dark mode support
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **File Handling**: React Dropzone for drag-and-drop file uploads

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **File Processing**: Multer for handling multipart/form-data uploads
- **Video Processing**: FFmpeg integration for video metadata extraction and conversion
- **Storage Pattern**: Abstracted storage interface with in-memory implementation (designed for future database integration)
- **Development Setup**: Vite middleware integration for development with hot module replacement

### Data Storage Solutions
- **Current Implementation**: In-memory storage using Maps for development and testing
- **Database Ready**: Drizzle ORM configured for PostgreSQL with complete schema definitions
- **File Storage**: Local filesystem for uploaded and processed video files
- **Session Management**: Prepared for PostgreSQL session storage using connect-pg-simple

### API Structure
- **RESTful Design**: Standard REST endpoints for video operations
- **Upload Endpoint**: POST `/api/videos/upload` with file size limits (500MB)
- **Progress Tracking**: GET endpoints for real-time processing status
- **Download Endpoints**: Separate endpoints for VR and mobile VR formats
- **Error Handling**: Centralized error middleware with structured JSON responses

### Video Processing Pipeline
- **Multi-Step Processing**: Organized into distinct steps (depth analysis, stereoscopic generation, quality enhancement, final rendering)
- **Progress Tracking**: Real-time progress updates for each processing step
- **Metadata Extraction**: Automatic video analysis for duration, resolution, and format validation
- **Output Formats**: Dual output generation for standard VR and mobile-optimized VR formats

### Authentication and Authorization
- **Schema Ready**: User authentication schema defined with username/password structure
- **Session Infrastructure**: Prepared session management system
- **Future Implementation**: Authentication middleware and user context management ready for implementation

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver for Neon serverless database
- **drizzle-orm**: Type-safe ORM for database operations with PostgreSQL dialect
- **@tanstack/react-query**: Server state management and caching for React

### UI and Design
- **@radix-ui/***: Comprehensive set of unstyled, accessible UI primitives
- **tailwindcss**: Utility-first CSS framework with custom configuration
- **class-variance-authority**: Utility for creating component variants
- **lucide-react**: Icon library for consistent iconography

### File and Media Processing
- **multer**: Express middleware for handling multipart/form-data (file uploads)
- **ffmpeg**: External system dependency for video processing and metadata extraction
- **react-dropzone**: File upload interface with drag-and-drop functionality

### Development Tools
- **vite**: Build tool and development server with React plugin
- **typescript**: Type safety and developer experience
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Development tooling for Replit environment

### Form and Validation
- **react-hook-form**: Form state management and validation
- **@hookform/resolvers**: Validation resolvers for react-hook-form
- **zod**: Schema validation library integrated with Drizzle ORM

### Utilities
- **date-fns**: Date manipulation and formatting
- **clsx**: Conditional className utility
- **nanoid**: Unique ID generation
- **wouter**: Lightweight routing library for React