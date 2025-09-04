# Project Summary
The IPL 2025 Cricket Management Game is a multiplayer platform designed for cricket fans to manage their own teams in the IPL. Players can participate in player auctions, select real-life players, and compete in a simulated league. The project emphasizes realistic match simulations, user management, and strategic gameplay, aiming to enhance fan engagement with the IPL.

# Project Module Description
The project consists of the following functional modules:
- **User Management**: Handles registration, login, and team selection for managers.
- **Auction System**: Manages player auctions, including draft and main auction processes.
- **Match Simulation**: Simulates live matches with real-time commentary and statistics.
- **Admin Panel**: Offers management tools for user accounts, teams, and player data, including Excel-based player management.
- **Training Management**: Enables managers to develop players' skills over time.
- **Dashboard**: Provides an overview of team performance, squad management, and player details.

# Directory Tree
```
shadcn-ui/
│
├── README.md                   # Project overview and setup instructions
├── components.json             # Component definitions
├── eslint.config.js            # ESLint configuration
├── index.html                  # Main HTML file
├── package.json                # Project dependencies and scripts
├── postcss.config.js           # PostCSS configuration
├── public/
│   ├── favicon.svg             # Favicon for the application
│   └── robots.txt              # Robots.txt for SEO
├── src/
│   ├── App.css                 # Global styles
│   ├── App.tsx                 # Main application component
│   ├── components/              # UI components
│   ├── hooks/                  # Custom hooks
│   ├── lib/                    # Utility functions and database management
│   ├── pages/                  # Application pages (Index, Dashboard, Auction, Admin, etc.)
│   ├── vite-env.d.ts           # Type definitions for Vite
│   ├── vite.config.ts          # Vite configuration
└── tailwind.config.ts          # Tailwind CSS configuration
```

# File Description Inventory
- **README.md**: Contains project overview and setup instructions.
- **components.json**: Defines reusable UI components.
- **eslint.config.js**: Configuration file for ESLint.
- **index.html**: Entry point for the web application.
- **package.json**: Lists dependencies and scripts for the project.
- **postcss.config.js**: Configuration for PostCSS.
- **public/**: Contains static assets like favicon and robots.txt.
- **src/**: Contains all source code, including components, pages, and utilities.

# Technology Stack
- **Frontend**: React, TypeScript
- **State Management**: React Query
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Linting**: ESLint

# Usage
To set up the project locally:
1. Install dependencies: `pnpm install`
2. Lint the code: `pnpm run lint`
3. Build the project: `pnpm run build`
