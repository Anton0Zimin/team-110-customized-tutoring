# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "Owl & Lion Access," a disability-focused student-tutor platform for Foothill & De Anza Colleges. The application is built with Next.js and React, featuring separate interfaces for students and tutors with accessibility accommodations and AI-powered study plans.

## Architecture

### Main Application Structure
- **app/page.tsx**: Main application entry point managing user role state (student/tutor) and student data
- **app/layout.tsx**: Root layout with Geist fonts and global styles
- **components/**: Contains all React components organized by functionality

### Key Components
- **login-screen.tsx**: Role-based login interface (student/tutor selection)
- **student-view.tsx**: Student portal with registration form and chatbot
- **tutor-view.tsx**: Tutor dashboard showing student profiles and study plans
- **student-registration-form.tsx**: Comprehensive form capturing disability info, accommodations, learning preferences, availability, and subjects
- **study-plan.tsx**: AI-generated personalized learning plans based on student's disability and preferences
- **student-chatbot.tsx**: Student-facing chatbot for questions about tutoring process
- **tutor-chatbot.tsx**: Tutor-facing chatbot providing guidance on student accommodations and teaching strategies
- **components/ui/**: Radix UI-based component library (shadcn/ui)

### Data Structure
The `Student` interface (defined in app/page.tsx) contains:
- Basic info (student_id, primary_disability)
- Accommodations needed (array of accommodation types)
- Learning preferences (style, format, modality)
- Availability schedule
- Preferred subjects
- Additional information and uploaded files

## Development Commands

### Primary Development Stack (Next.js)
```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server  
npm start

# Lint code
npm run lint
```

### Secondary React App (owl-lion-access/ subdirectory)
```bash
# Navigate to subdirectory first
cd owl-lion-access

# Development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Technology Stack

- **Framework**: Next.js 15.2.4 with React 19
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives (shadcn/ui)
- **Typography**: Geist Sans and Mono fonts
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **Color Scheme**: Custom burgundy (#8B1538) brand color

## Design Patterns

### Accessibility-First Design
- All components use semantic HTML and ARIA attributes
- Forms include proper labeling and validation
- Color contrast meets WCAG guidelines
- Typography uses serif fonts (family-serif class) for better readability

### Component Architecture
- Functional components with TypeScript
- Props interfaces clearly defined
- Reusable UI components in components/ui/
- Custom hooks for state management (use-mobile, use-toast)

### State Management
- React useState for local component state
- Props drilling for shared state between components
- No external state management library currently used

## Configuration Notes

- **next.config.mjs**: ESLint and TypeScript errors ignored during builds, images unoptimized
- **tsconfig.json**: Path aliases configured (@/* maps to ./*)
- **tailwind.config**: Custom animation and design tokens
- **components.json**: shadcn/ui configuration

## Disability Support Features

The application includes specialized support for:
- Dyslexia (multi-sensory approaches, visual aids)
- ADHD (structured routines, frequent breaks)
- Autism Spectrum Disorder (consistent routines, clear communication)
- Visual/Hearing Impairments (appropriate accommodations)
- Physical Disabilities (accessibility adaptations)

Study plans and chatbot responses are tailored based on the specific disability and learning preferences entered during registration.