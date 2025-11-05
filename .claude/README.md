# WorkoutApp Documentation

**Last Updated:** 2025-11-05

---

## Overview

This directory contains comprehensive documentation for the WorkoutApp project - a Progressive Web App for workout tracking. This documentation serves as the central source of truth for developers working on the project, providing complete context without needing to scan the entire codebase.

---

## Quick Start

**New to the project?** Start here:

1. Read [Project Architecture](System/project_architecture.md) to understand the overall system design
2. Review [Database Schema](System/database_schema.md) to understand data structures
3. Check [API Documentation](System/api_documentation.md) for service layer interfaces

---

## Documentation Structure

```
.claude/
├── README.md              # This file - documentation index
├── System/                # Project architecture & technical specs
│   ├── project_architecture.md
│   ├── database_schema.md
│   └── api_documentation.md
├── SOP/                   # Standard Operating Procedures
│   └── common_mistakes.md
└── Tasks/                 # Feature implementation records
    └── 2025-11-05_documentation-system.md
```

---

## System Documentation

### [Project Architecture](System/project_architecture.md)

**Purpose:** High-level overview of the entire system

**Contents:**
- Project goals and purpose
- Tech stack breakdown (React 19, Vite, Tailwind CSS)
- Key architectural decisions and rationale
- Component hierarchy
- Data flow architecture
- PWA features (Service Worker, Wake Lock, Notifications)
- Deployment strategy
- Future enhancement considerations

**When to read:**
- Starting work on the project
- Planning major architectural changes
- Onboarding new developers
- Making technology decisions

**When to update:**
- Adding new frameworks or libraries
- Changing build tools or deployment
- Implementing new PWA features
- Making significant architectural changes

---

### [Database Schema](System/database_schema.md)

**Purpose:** Complete data model documentation

**Contents:**
- localStorage structure (4 storage keys)
- Data models for exercises, templates, completed workouts, preferences
- Field types, constraints, and validation rules
- Entity relationships and foreign keys
- Seed data (27 exercises, 4 PHAT templates)
- Data versioning and migration strategy
- Backup/restore procedures
- Storage constraints and performance

**When to read:**
- Working with data models
- Implementing new features that store data
- Debugging data issues
- Planning data migrations

**When to update:**
- Adding new data fields
- Creating new data models
- Changing data structures
- Updating seed data
- Incrementing data version

---

### [API Documentation](System/api_documentation.md)

**Purpose:** Interface documentation for all internal and external APIs

**Contents:**
- localStorage Service API (CRUD operations)
- Workout Context API (React Context methods)
- Browser APIs (Service Worker, Wake Lock, Notifications)
- Utility functions (validation, formatting, ID generation)
- Error handling strategies
- Testing approaches

**When to read:**
- Integrating with service layer
- Using Context API in components
- Implementing PWA features
- Writing utility functions

**When to update:**
- Adding new service methods
- Creating new Context functions
- Integrating new browser APIs
- Adding utility functions

---

## Standard Operating Procedures (SOP)

### [Common Mistakes](SOP/common_mistakes.md)

**Purpose:** Document known pitfalls and solutions

**Contents:**
- Common bugs and their fixes
- Anti-patterns to avoid
- Performance gotchas
- Browser compatibility issues
- localStorage limitations

**When to read:**
- Debugging similar issues
- Implementing new features
- Code review process

**When to update:**
- After fixing non-obvious bugs
- Discovering new pitfalls
- Learning better patterns

---

## Task Documentation

Task documentation captures implementation details for features and significant changes. Each task file follows this naming convention:

**Format:** `YYYY-MM-DD_feature-name.md`

### Current Tasks

#### [2025-11-05 - Documentation System](Tasks/2025-11-05_documentation-system.md)

**Status:** Completed

**Summary:** Initial documentation system setup with project architecture, database schema, API documentation, and SOP templates.

---

## How to Use This Documentation

### For New Developers

1. **Day 1:** Read Project Architecture to understand the system
2. **Day 2:** Review Database Schema and API Documentation
3. **Day 3:** Skim through Task history to understand recent changes
4. **Ongoing:** Reference SOPs when encountering issues

### For Existing Developers

- **Before implementing a feature:** Check if similar work exists in Tasks/
- **During development:** Reference API Documentation for interfaces
- **After fixing a bug:** Update common_mistakes.md if non-obvious
- **After completing a feature:** Create Task documentation

### For Code Reviews

1. Verify changes align with architectural patterns
2. Check if database schema needs updating
3. Ensure API documentation reflects new methods
4. Confirm SOPs are updated if new patterns emerge

---

## Documentation Maintenance

### Update Frequency

| Document | Update Trigger |
|----------|---------------|
| project_architecture.md | Major tech changes, architectural shifts |
| database_schema.md | Data model changes, new storage keys |
| api_documentation.md | New methods, API changes |
| common_mistakes.md | After fixing non-trivial bugs |
| Task docs | After completing features |

### Update Process

1. Make code changes
2. Update relevant documentation files
3. Update "Last Updated" date in modified files
4. Update this README if new files are added
5. Commit documentation with code changes

---

## Documentation Standards

### Writing Style

- **Concise:** Get to the point quickly
- **Specific:** Use concrete examples with code snippets
- **Accurate:** Verify information against actual codebase
- **Scannable:** Use headers, lists, and tables for easy navigation

### Code Examples

- Use real code from the project (not pseudocode)
- Include file paths in comments
- Show complete, runnable examples
- Add inline comments for clarity

### Markdown Formatting

- Use `# H1` for document title
- Use `## H2` for main sections
- Use `### H3` for subsections
- Use code fences with language tags: ` ```javascript `
- Use tables for structured data
- Use **bold** for emphasis, not italics

---

## Project Statistics

**As of 2025-11-05:**

- **Lines of Code:** ~3,000
- **Components:** 9 (6 pages + 3 shared)
- **Dependencies:** 15 npm packages
- **Storage Keys:** 4 localStorage keys
- **Seed Data:** 27 exercises + 4 workout templates
- **Routes:** 6 application routes

---

## Tech Stack Summary

**Frontend:**
- React 19.1.1
- React Router 7.9.3
- Tailwind CSS 3.4.18
- Recharts 3.2.1
- Lucide React 0.544.0
- date-fns 4.1.0

**Build Tools:**
- Vite 7.1.7
- PostCSS 8.5.6
- Autoprefixer 10.4.21
- ESLint 9.36.0

**PWA:**
- Custom Service Worker
- Wake Lock API
- Notifications API
- Cache API

**Data:**
- localStorage (no backend)
- JSON data format
- Client-side only

---

## Key Files Quick Reference

### Entry Points
- `/index.html` - HTML entry with PWA meta tags
- `/src/main.jsx` - React mount point
- `/src/App.jsx` - Router and Context setup

### Core Services
- `/src/services/localStorageService.js` - Data persistence layer
- `/src/contexts/WorkoutContext.jsx` - Global state management
- `/src/utils/helpers.js` - Utility functions

### PWA Assets
- `/public/service-worker.js` - Service Worker
- `/public/manifest.json` - PWA manifest
- `/src/utils/serviceWorkerRegistration.js` - SW registration

### Pages (Routes)
- `/src/pages/Home.jsx` - Landing page with templates
- `/src/pages/CreateWorkout.jsx` - Workout builder
- `/src/pages/ActiveWorkout.jsx` - Live workout tracking
- `/src/pages/History.jsx` - Completed workouts
- `/src/pages/Statistics.jsx` - Progress charts
- `/src/pages/Admin.jsx` - Debug panel

### Configuration
- `/vite.config.js` - Build configuration
- `/tailwind.config.js` - Design system
- `/package.json` - Dependencies

---

## Getting Help

### Internal Resources

1. **This documentation** - Start here for project context
2. **Code comments** - Implementation details in source files
3. **Git history** - `git log` for change history
4. **Admin panel** - `/admin` route for debugging tools

### External Resources

- [React 19 Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [PWA Docs](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

## Contributing to Documentation

### When to Create New Docs

**System Docs:** When adding major features or architectural components

**SOP:** When discovering reusable patterns or common mistakes

**Task Docs:** After completing features or significant implementations

### Documentation Checklist

Before committing documentation changes:

- [ ] Information is accurate (verified against code)
- [ ] Examples are tested and work
- [ ] File paths are correct
- [ ] Code snippets are properly formatted
- [ ] "Last Updated" date is current
- [ ] README.md index is updated (if new files)
- [ ] No duplicate information across files
- [ ] Cross-references are valid

---

## Version History

### v1.0 (2025-11-05)

**Initial Documentation System**

- Created `.claude/` documentation structure
- Added project_architecture.md (10 key architectural decisions)
- Added database_schema.md (4 storage keys, complete schemas)
- Added api_documentation.md (4 API layers documented)
- Added common_mistakes.md template
- Added this README.md index

---

## Future Documentation Plans

### Planned Additions

- **Testing Guide** - When automated tests are added
- **Deployment Guide** - Detailed deployment procedures
- **Performance Optimization** - Best practices for optimization
- **Accessibility Guide** - WCAG compliance checklist
- **Mobile Testing SOP** - Device testing procedures
- **Release Process** - Version bumping and release notes

### Enhancement Ideas

- Add diagrams (component hierarchy, data flow)
- Create video walkthroughs for complex features
- Add troubleshooting decision trees
- Create quick reference cards

---

## Contact & Support

**Project Repository:** https://github.com/TalGoldDev/WorkoutApp

**Issues & Questions:** Use GitHub Issues

**Documentation Issues:** Create issue with `documentation` label

---

**Remember:** Good documentation reduces context-switching, speeds up development, and prevents repeated mistakes. Keep it updated, keep it accurate, and keep it concise.
