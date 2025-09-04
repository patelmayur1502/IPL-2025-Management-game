# IPL 2025 Cricket Management Game - MVP Development Plan

## Core Files to Create (Maximum 8 files):

1. **src/pages/Index.tsx** - Main landing page with team selection and login
2. **src/pages/Dashboard.tsx** - Manager dashboard with squad management
3. **src/pages/Auction.tsx** - Draft and main auction interface
4. **src/pages/Match.tsx** - Live match simulation and viewing
5. **src/pages/Admin.tsx** - Admin panel for game management
6. **src/components/PlayerCard.tsx** - Reusable player display component
7. **src/lib/gameEngine.ts** - Match simulation and game logic
8. **src/lib/database.ts** - Local storage database simulation

## MVP Features (Simplified for initial version):
- User registration and team selection (10 IPL teams)
- Basic player database with skills (1-20 rating system)
- Simplified auction system (draft only for MVP)
- Basic match simulation (1 minute per over)
- Player management and squad building
- Admin panel for basic game management

## Technical Implementation:
- Use localStorage for data persistence (no backend for MVP)
- React components with TypeScript
- Shadcn/ui components for UI
- Real-time match simulation using intervals
- Star rating system (1-10 yellow stars, 11-20 red stars)

## Simplified Data Structure:
- Players: name, team, skills, traits, price, age
- Teams: name, manager, budget, squad
- Matches: teams, scores, results
- Users: id, password, teamId, managerName

This MVP will demonstrate core gameplay mechanics and can be expanded later.