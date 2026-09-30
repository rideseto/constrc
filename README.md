# CONSTRC — Next-Gen 3D Interactive Construction Platform

A hyper-realistic, interactive 3D digital twin website for heavy civil engineering, commercial architecture, and turnkey infrastructure projects.

Inspired by premium architectural designs and the Constrc design language, featuring interactive Three.js 3D WebGL digital twin models, 4D BIM construction timeline scrubbers, glassmorphism cards, and real photographic project assets.

---

## Key Features

- **Pinned 3D WebGL Digital Twin (Three.js)**:
  - Procedural 3D skyscraper digital twin with concrete foundations, steel trusses, crane structures, and animated cable rigging.
  - Interactive camera modes: **Cinematic Orbit**, **Inspection Mode**, **Wireframe Structural X-Ray**, and **Free Orbit**.
- **4D BIM Construction Timeline Scrubber**:
  - Step through 5 phases of building lifecycle: Groundbreak, Foundation, Superstructure, Facade & MEP, and Commissioning.
- **Glassmorphic UI & Crisp Typography**:
  - High-contrast, clean translucent glass styling with WCAG AAA readability over the 3D canvas.
- **Real High-Resolution Photographic Media**:
  - Authentic, local photographs for all major portfolio projects, turnkey services, about sections, news publications, and client reviewers.
- **Interactive Tools**:
  - Real-time 3D BIM Feasibility & Turnkey ROI Calculator.
  - Interactive Project Comparison Matrix.
  - Interactive RFP Tender Application Modal.

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/rideseto/constrc.git

# Navigate into the project directory
cd constrc

# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit `http://localhost:3000/` in your browser.

### Production Build

```bash
npm run build
```

The compiled production assets will be placed in the `dist/` directory.

---

## Deployment

This repository is configured with automated GitHub Actions (`.github/workflows/deploy.yml`) to automatically build and deploy the production bundle to GitHub Pages whenever changes are pushed to `main`.

---

## License

MIT
