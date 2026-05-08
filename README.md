# Cursor Workshop: Bud — Lost Pet Finder

Welcome to the **Cursor Workshop**! This repository serves as a hands-on environment for exploring AI-assisted development using Cursor. The primary project in this workspace is **Bud**, a mobile-first web application prototype designed to help communities find and report lost pets.

---

## 🐾 About Bud

**Bud** is a polished, interactive web prototype that demonstrates modern frontend development practices. It features a phone-frame UI, an interactive map, and community reporting tools.

### Key Features
- **Community Board:** A scrollable feed of lost and found pets with distance hints and quick actions.
- **Interactive Map:** A Leaflet-powered map using OpenStreetMap tiles to display pet locations visually.
- **Reporting Flow:** A multi-step form for users to report lost or found animals.
- **Offline Support:** Built-in offline awareness with IndexedDB-backed queues that sync when the connection is restored.
- **Realtime Data (Optional):** Can be connected to Supabase for live updates, authentication, and persistent storage.
- **Local Fallback:** Runs perfectly without a backend using a rich local dataset, making it easy to test and develop immediately.

---

## 🛠 Tech Stack

The workspace is built with modern, scalable technologies:

- **Frontend Framework:** [React 19](https://react.dev/) & [Vite 6](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (using custom "Grounded Guardian" design tokens)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Mapping:** [Leaflet](https://leafletjs.com/) & [react-leaflet](https://react-leaflet.js.org/)
- **Backend (Optional):** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Realtime)

---

## 🚀 Getting Started

To get the project up and running locally, follow these steps:

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v18 or newer recommended) and `npm` installed.

### 2. Installation
Navigate to the `bud` directory and install the dependencies:

```bash
cd bud
npm install
```

### 3. Start the Development Server
Run the local Vite development server:

```bash
npm run dev
```

Open the URL provided in your terminal (typically `http://localhost:5173`). The UI is designed for a mobile viewport, so it looks best when viewed in a narrow browser window or using your browser's developer tools mobile emulator.

---

## 📁 Workspace Structure

```text
cursor_workshop/
├── bud/                    # Main application directory
│   ├── docs/demo/          # UI screenshots and gallery
│   ├── src/                # Application source code
│   │   ├── components/     # Reusable UI components (PhoneFrame, BottomNav, etc.)
│   │   ├── screens/        # Main application views (MapView, CommunityBoard, etc.)
│   │   ├── stores/         # Zustand state management
│   │   ├── lib/            # Utilities (Supabase client, offline queues)
│   │   └── data/           # Local fallback seed data
│   ├── supabase/           # Database migrations and schema
│   ├── AGENTS.md           # AI agent instructions and repository guidelines
│   └── README.md           # Detailed application documentation
├── .playwright-mcp/        # Playwright MCP logs and snapshots for automated browser testing
└── README.md               # This file
```

---

## 🤖 Using Cursor with this Workspace

This repository is optimized for AI-assisted development with Cursor:
- **`bud/AGENTS.md`**: Contains specific guidelines for AI agents, including coding style, project structure, and testing rules. Cursor will automatically read this to understand the project's context.
- **Playwright MCP**: The `.playwright-mcp` directory contains traces of automated browser interactions, demonstrating how AI agents can interact with the live application to take screenshots and verify UI.

---

## 📖 Further Reading

For a deep dive into the application's features, environment variable configuration (including Supabase setup), and a full screenshot gallery, please see the detailed documentation in the application folder:

👉 **[Read the full Bud Documentation](bud/README.md)**
