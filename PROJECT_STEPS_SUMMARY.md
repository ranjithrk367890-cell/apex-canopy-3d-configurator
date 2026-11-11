# ApexCanopy 3D Product Configurator - Project Steps & Implementation Summary

This document captures the complete history of actions, architectural decisions, and technical implementations executed to deliver the **ApexCanopy 3D Interactive Tent Product Configurator**.

---

## 📌 Table of Contents
1. [Overview & Requirements](#1-overview--requirements)
2. [Step-by-Step Implementation Record](#2-step-by-step-implementation-record)
   - [Step 1: 3D Asset Inspection & Procedural GLB Generation](#step-1-3d-asset-inspection--procedural-glb-generation)
   - [Step 2: Tech Stack Configuration & Dependencies](#step-2-tech-stack-configuration--dependencies)
   - [Step 3: 3D Product Viewer (React Three Fiber & Drei)](#step-3-3d-product-viewer-react-three-fiber--drei)
   - [Step 4: Interactive 2D Design Studio & Canvas Sync](#step-4-interactive-2d-design-studio--canvas-sync)
   - [Step 5: Modular Customization System](#step-5-modular-customization-system)
   - [Step 6: Centralized Pricing Engine & Express REST API](#step-6-centralized-pricing-engine--express-rest-api)
   - [Step 7: Shopify Mock Cart Integration](#step-7-shopify-mock-cart-integration)
   - [Step 8: Vector PDF Quotation Generator (jsPDF)](#step-8-vector-pdf-quotation-generator-jspdf)
   - [Step 9: Indian Rupee (INR / ₹) Currency Localization](#step-9-indian-rupee-inr---currency-localization)
   - [Step 10: Automated Testing Suite & Production Build](#step-10-automated-testing-suite--production-build)
3. [Project File Map & Architecture](#3-project-file-map--architecture)
4. [Running the Application](#4-running-the-application)
5. [API & Verification Endpoints](#5-api--verification-endpoints)

---

## 1. Overview & Requirements
Built to fulfill a senior-level technical assessment for a 3D e-commerce commercial canopy configurator:
- **Core Stack**: React 18, TypeScript, Vite, Three.js, React Three Fiber (`@react-three/fiber`), `@react-three/drei`, HTML5 Canvas API, jsPDF, Tailwind CSS, Lucide React, Express.js.
- **Key Objective**: Real-time 3D model customization (colors, finishes, modular sidewalls, ballast weights) combined with a 2D interactive canvas studio that synchronizes uploaded logos and custom text decals onto 3D surfaces in real time.
- **Default Currency**: Indian Rupees (`INR` / `₹`) with localized formatting via `Intl.NumberFormat('en-IN')`.

---

## 2. Step-by-Step Implementation Record

### Step 1: 3D Asset Inspection & Procedural GLB Generation
- **Action**: Inspected the workspace for 3D assets. Because no ready-made GLB was pre-packaged, built an automated procedural generator script [`scripts/generateTentModel.js`](file:///c:/Users/ELCOT/OneDrive/Desktop/3D%20project/scripts/generateTentModel.js).
- **Outcome**: Created [`public/models/tent.glb`](file:///c:/Users/ELCOT/OneDrive/Desktop/3D%20project/public/models/tent.glb) (100.5 KB) with exact metric dimensions ($3.23\text{m} \times 3.20\text{m} \times 3.23\text{m}$ for a commercial 10x10 ft canopy).
- **Meshes Built & UV-Mapped**:
  - `roof`: 4-sided pyramid roof canopy with normalized $[0, 1]$ planar UV mapping.
  - `valance_front`, `valance_back`, `valance_left`, `valance_right`: Perimeter overhangs for branding prints.
  - `frame_legs`: 4 anodized aluminum corner legs with footpad brackets.
  - `frame_trusses`: Cross-truss scissor beams, central peak mast, and collar sliders.
  - `wall_back`, `wall_left`, `wall_right`, `wall_front`: 4 independent modular sidewalls.
  - `accessories_weights`: 4 leg weight ballast plates.
- **Validation**: Wrote and executed [`scripts/inspectModel.js`](file:///c:/Users/ELCOT/OneDrive/Desktop/3D%20project/scripts/inspectModel.js) to confirm hierarchy, vertex counts, materials, and UV coordinates.

### Step 2: Tech Stack Configuration & Dependencies
- **Action**: Configured Vite, Tailwind CSS, TypeScript, and PostCSS.
- **Packages Installed**:
  - `three`, `@react-three/fiber`, `@react-three/drei`
  - `jspdf`, `lucide-react`, `canvas-confetti`
  - `express`, `cors`
  - `@types/three`, `@types/react`, `@types/react-dom`, `@types/node`

### Step 3: 3D Product Viewer (React Three Fiber & Drei)
- **Component**: [`src/components/viewer/TentViewer3D.tsx`](file:///c:/Users/ELCOT/OneDrive/Desktop/3D%20project/src/components/viewer/TentViewer3D.tsx)
- **Features Implemented**:
  - Smooth OrbitControls with polar angle limits ($[0.1, \pi/2 - 0.02]$) to prevent underground clipping.
  - Camera view presets: **3D Isometric**, **Front Elevation**, **Roof Top Branding View**, and **Interior Walk-in View**.
  - Three lighting environment profiles: **Studio Neutral**, **Bright Outdoor Daylight**, and **Evening / Night Showcase**.
  - Contact ground shadow plane using Drei's `ContactShadows`.
  - Wireframe structural inspection mode for engineering verification.
  - 3D Interactive Hotspot annotation pins positioned on key structural points (Pyramid Peak, Anodized Scissor Truss, Cast-Iron Weight Plates) with interactive tooltips.
  - One-click viewport screenshot export (`.png`).

### Step 4: Interactive 2D Design Studio & Canvas Sync
- **Component**: [`src/components/editor/DesignCanvas2D.tsx`](file:///c:/Users/ELCOT/OneDrive/Desktop/3D%20project/src/components/editor/DesignCanvas2D.tsx) & [`src/utils/textureGenerator.ts`](file:///c:/Users/ELCOT/OneDrive/Desktop/3D%20project/src/utils/textureGenerator.ts)
- **Features Implemented**:
  - HTML5 Canvas dynamic texture pipeline: Generates 2048x2048 high-resolution textures dynamically bound to `THREE.CanvasTexture`.
  - Element Support: Uploaded vector/raster logos (`.png`, `.jpg`, `.svg`) and custom typographic text lines.
  - Canvas Interactions: Drag-and-drop repositioning, corner scaling handle, rotation handle, delete button, and selection bounding boxes.
  - Undo / Redo history stack.
  - Target Surface Selector: Switch between Front Valance, Back Valance, Left Valance, Right Valance, and Roof Canopy.
  - Real-time 2D-to-3D synchronization: Every modification in the 2D studio updates the 3D model immediately without reload.

### Step 5: Modular Customization System
- **Sidebar & Panels**:
  - [`src/components/customization/CustomizationSidebar.tsx`](file:///c:/Users/ELCOT/OneDrive/Desktop/3D%20project/src/components/customization/CustomizationSidebar.tsx)
  - [`src/components/customization/GeneralOptions.tsx`](file:///c:/Users/ELCOT/OneDrive/Desktop/3D%20project/src/components/customization/GeneralOptions.tsx)
  - [`src/components/customization/ColorOptions.tsx`](file:///c:/Users/ELCOT/OneDrive/Desktop/3D%20project/src/components/customization/ColorOptions.tsx)
  - [`src/components/customization/LogoUploader.tsx`](file:///c:/Users/ELCOT/OneDrive/Desktop/3D%20project/src/components/customization/LogoUploader.tsx)
  - [`src/components/customization/TextEditor.tsx`](file:///c:/Users/ELCOT/OneDrive/Desktop/3D%20project/src/components/customization/TextEditor.tsx)
- **Options Provided**:
  - Footprint size: 10x10 ft (3x3m), 10x15 ft (3x4.5m), 10x20 ft (3x6m).
  - Frame finish: Anodized Silver Aluminum, Matte Powder-Coated Black, Gloss Commercial White.
  - Roof fabric: 8 commercial UV-resistant colors with custom hex color picker.
  - Valance trim: Independent secondary color matching or contrast piping.
  - 4 Sidewalls: Individually toggleable with 3 distinct architectural styles (Solid Wall, Arched Cathedral Window Wall, Roll-Up Zipper Door Wall).
  - Ballast accessories: Heavy-duty 20kg rubberized leg weight plates toggle.

### Step 6: Centralized Pricing Engine & Express REST API
- **Backend Service**: [`server/index.js`](file:///c:/Users/ELCOT/OneDrive/Desktop/3D%20project/server/index.js) running on port `5001`.
  - `POST /api/pricing/calculate`: Validates incoming payload, calculates line items, accessories, custom print charges, 18% GST, and grand total.
  - `GET /api/pricing/config`: Exposes available sizes, finishes, and price constants.
  - `GET /api/health`: Health-check endpoint.
- **Shared Mathematical Engine**: [`src/services/pricingCalculation.ts`](file:///c:/Users/ELCOT/OneDrive/Desktop/3D%20project/src/services/pricingCalculation.ts).
- **Client Client Service**: [`src/services/pricingApi.ts`](file:///c:/Users/ELCOT/OneDrive/Desktop/3D%20project/src/services/pricingApi.ts) connects to Express API with instant offline fallback calculation if backend is unreachable.

### Step 7: Shopify Mock Cart Integration
- **Service**: [`src/services/cartService.ts`](file:///c:/Users/ELCOT/OneDrive/Desktop/3D%20project/src/services/cartService.ts)
- **Drawer Component**: [`src/components/cart/ShopifyCartDrawer.tsx`](file:///c:/Users/ELCOT/OneDrive/Desktop/3D%20project/src/components/cart/ShopifyCartDrawer.tsx)
- **Features Implemented**:
  - Shopify Storefront API-compliant line item schema (variant IDs, properties, title, pricing, quantity).
  - Custom line item properties: Footprint size, frame finish, wall configurations, print element breakdown.
  - LocalStorage persistence with reactive event emitter subscribers.
  - Quantity increment, decrement, and item removal.
  - Simulated checkout workflow modal with confetti celebration (`canvas-confetti`).

### Step 8: Vector PDF Quotation Generator (jsPDF)
- **Module**: [`src/utils/generatePDF.ts`](file:///c:/Users/ELCOT/OneDrive/Desktop/3D%20project/src/utils/generatePDF.ts)
- **Features Implemented**:
  - Downloads professional A4 vector specification quotation sheet.
  - Includes Header with reference number, timestamp, customer spec sheet title.
  - Bill of Materials & Technical Specifications table (Frame material, size, fabric grade, sidewalls count, weights).
  - Itemized Pricing Breakdown table in INR (Base unit, frame upgrade, modular walls, custom printing setup, 18% GST, Grand Total).
  - Commercial terms, warranty info (5-Year Heavy Duty Warranty), and customer signature sign-off box.

### Step 9: Indian Rupee (INR / ₹) Currency Localization
- **Formatter**: [`src/utils/currency.ts`](file:///c:/Users/ELCOT/OneDrive/Desktop/3D%20project/src/utils/currency.ts)
  ```typescript
  export const formatINR = (amount: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };
  ```
- **Pricing Transition**: Replaced USD baseline with Indian commercial rates:
  - 10x10 Base: ₹18,999
  - 10x15 Base: ₹26,999
  - 10x20 Base: ₹34,999
  - Matte Black Finish: +₹1,800
  - Commercial White Finish: +₹1,400
  - Solid Sidewall: +₹2,499 each
  - Cathedral Window Sidewall: +₹3,299 each
  - Zipper Door Sidewall: +₹3,799 each
  - Heavy Duty Ballast Plates: +₹3,499
  - Custom Print Setup: +₹1,800
  - Additional Print Element: +₹800
  - Taxes: Configured to standard 18% GST (`₹` symbol displayed across all web UI, cart, order summary, and line items).

### Step 10: Automated Testing Suite & Production Build
- **Tests Added**:
  - [`tests/pricing.test.js`](file:///c:/Users/ELCOT/OneDrive/Desktop/3D%20project/tests/pricing.test.js): 4 integration test cases validating Express API calculation, GST precision, and add-on charges.
  - [`tests/model.test.js`](file:///c:/Users/ELCOT/OneDrive/Desktop/3D%20project/tests/model.test.js): 4 unit test cases validating GLB existence, file size, node hierarchy, and mesh bounding box.
- **Verification Commands Executed**:
  - `npm test`: **8/8 Tests Passed**
  - `npx tsc -b`: **0 TypeScript Errors**
  - `npm run build`: Production bundle built cleanly into `dist/`

---

## 3. Project File Map & Architecture

```
3D project/
├── public/
│   ├── assets/logos/           # Vector branding samples (Summit Outdoor, TechNova)
│   └── models/
│       └── tent.glb            # Commercial 10x10 canopy 3D model (100.5 KB)
├── scripts/
│   ├── generateTentModel.js    # Procedural 3D model generator & GLTF exporter
│   └── inspectModel.js         # Mesh validator & bounding box inspector
├── server/
│   └── index.js                # Express mock pricing API server (port 5001)
├── src/
│   ├── components/
│   │   ├── cart/               # ShopifyCartDrawer.tsx
│   │   ├── customization/      # Sidebar, GeneralOptions, ColorOptions, LogoUploader, TextEditor
│   │   ├── editor/             # DesignCanvas2D.tsx (2D interactive canvas studio)
│   │   ├── layout/             # Navbar.tsx
│   │   ├── pricing/            # ConfigurationSummary.tsx (Live order summary & actions)
│   │   └── viewer/             # TentViewer3D.tsx (R3F Canvas, OrbitControls, Hotspots)
│   ├── services/
│   │   ├── cartService.ts      # LocalStorage Shopify-compliant cart store
│   │   ├── pricingApi.ts       # Backend REST client with transparent fallback
│   │   └── pricingCalculation.ts # Single source of truth for pricing & 18% GST
│   ├── types/
│   │   └── configurator.ts     # Domain models & TypeScript interfaces
│   ├── utils/
│   │   ├── constants.ts        # Default configuration, colors, INR rates, fonts
│   │   ├── currency.ts         # formatINR Intl formatter
│   │   ├── generatePDF.ts      # jsPDF A4 quotation generation
│   │   ├── modelUtils.ts       # GLTF mesh traverser & material synchronizer
│   │   └── textureGenerator.ts # HTML5 Canvas dynamic texture builder
│   ├── App.tsx                 # Responsive 3-column configurator layout
│   └── main.tsx                # React DOM entry point
├── tests/
│   ├── model.test.js           # 3D GLB integrity unit tests
│   └── pricing.test.js         # Pricing math & Express API integration tests
├── package.json                # Project dependencies & npm scripts
├── README.md                   # Comprehensive developer documentation
├── .gitignore                  # Git exclusion rules
└── PROJECT_STEPS_SUMMARY.md    # This historical summary document
```

---

## 4. Running the Application

### Concurrently (Frontend + Backend):
```bash
npm run dev:all
```

### Separately:
1. **Backend API**:
   ```bash
   npm run server
   ```
   *Runs at:* `http://127.0.0.1:5001`

2. **Frontend UI**:
   ```bash
   npm run dev
   ```
   *Runs at:* `http://localhost:5173`

### Run Automated Tests:
```bash
npm test
```

### Production Build:
```bash
npm run build
```

---

## 5. API & Verification Endpoints

| Resource | Protocol | URL / Port | Purpose |
|---|---|---|---|
| Frontend Web UI | HTTP | `http://localhost:5173/` | Interactive 3D/2D Configurator |
| Backend API Health | HTTP | `http://127.0.0.1:5001/api/health` | Server status probe |
| Pricing API | HTTP POST | `http://127.0.0.1:5001/api/pricing/calculate` | Calculate line items & GST in INR |
| Pricing Config | HTTP GET | `http://127.0.0.1:5001/api/pricing/config` | Sizes, frame finishes, base prices |
