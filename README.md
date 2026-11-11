# 3D Interactive Tent Product Configurator

A production-grade, enterprise 3D Product Customization platform built for commercial event tents and pop-up canopy products. Developed with **React 18**, **TypeScript**, **Three.js**, **React Three Fiber (R3F)**, **@react-three/drei**, **HTML5 Canvas API**, **jsPDF**, and **Node.js/Express**.

---

## 1. Executive Summary & Architecture

The **ApexCanopy 3D Pro Configurator** allows enterprise customers and event vendors to customize a commercial pop-up canopy tent in real-time. Changes made in either the 3D Orbit Viewport or the 2D Design Studio synchronize instantly across all components, updating live itemized pricing, Shopify cart data, and vector PDF quotations.

```
                              ┌────────────────────────────────────────┐
                              │        Shared TentConfiguration        │
                              └───────────────────┬────────────────────┘
                                                  │
          ┌───────────────────────────────────────┼───────────────────────────────────────┐
          ▼                                       ▼                                       ▼
┌───────────────────┐                   ┌───────────────────┐                   ┌───────────────────┐
│  Left Controller  │                   │  Center Viewport  │                   │   Right Summary   │
│ - Hardware & Size │                   │ - Three.js Scene  │                   │ - Dynamic Pricing │
│ - Colors & Walls  │◄─────────────────►│ - R3F TentModel   │◄─────────────────►│ - Shopify Mock    │
│ - 2D Design Studio│  (2D/3D Texture   │ - Orbit Controls  │   (Centralized    │ - jsPDF Quotation │
│ - Logo & Text     │   Sync Pipeline)  │ - Camera Presets  │   Pricing API)    │   Download        │
└───────────────────┘                   └───────────────────┘                   └───────────────────┘
```

---

## 2. 3D Model Asset Inspection & Hierarchy

The application integrates a true-to-scale commercial 10x10 ft (3.0m × 3.0m × 3.2m peak height) Pop-Up Canopy Tent binary asset (`/public/models/tent.glb`).

### Model Inspection Report (`tent.glb`)

| Property | Value | Notes |
| :--- | :--- | :--- |
| **Asset Format** | Binary glTF (`.glb`) | Validated with `GLTFLoader` |
| **Footprint Dimensions** | $3.23\text{m} \times 3.20\text{m} \times 3.23\text{m}$ | $10\times10\text{ft}$ commercial event standard |
| **Scene Center** | $[0.00, 1.60, 0.00]$ | Bounding box: $Y \in [0.00, 3.20\text{m}]$ |
| **Default Camera Target** | $[0.00, 1.40, 0.00]$ | Isometric angle: $[4.6, 2.8, 4.6]$ |
| **Mesh Count** | 45 sub-meshes | Separated structural components |
| **UV Unwrapping** | Verified (Normals + UV coords) | Seamless 1:1 canvas texture projection |

### Component & Mesh Mapping

* **Canopy Roof (`roof`)**: 4-sided pyramid with normalized UV coordinates mapped to `material_roof` for full-canopy printing and fabric color tinting.
* **Valances (`valance_front`, `valance_back`, `valance_left`, `valance_right`)**: Eave drop borders hanging from $y=2.1\text{m}$ to $y=1.85\text{m}$. Front valance features dedicated logo & slogan printing; side valances support independent or matched color schemes.
* **Frame Legs (`frame_legs`)**: 4 telescoping square aluminum/steel corner columns with molded footplates and leg slider brackets.
* **Scissor Trusses (`frame_trusses`)**: Accordion perimeter cross-braces, center peak mast, tension cap, and 4 corner roof rafters.
* **Modular Sidewalls (`wall_back`, `wall_left`, `wall_right`, `wall_front`)**: Independent $3.0\text{m} \times 2.1\text{m}$ panels with individual visibility toggling (`visible = true/false`), color customizer, and 3 distinct panel styles:
  * **Solid Wall**: Complete weather-resistant backdrop.
  * **Cathedral Window Wall**: 3 arched windows with transparent glass tint.
  * **Zipper Door Wall**: Dual-zipper roll-up entryway with hold straps.
* **Accessories (`accessories_weights`)**: 4 heavy-duty cast-iron weight plates positioned at corner footpads for wind stabilization.

---

## 3. Core Feature Implementations

### A. 2D and 3D Synchronization Pipeline
A bidirectional synchronization engine connects the 2D Design Studio with the WebGL 3D model:
1. When elements (logos, text, or wall patterns) are dragged, resized, or recolored, `renderSurfaceToCanvas()` draws onto an offscreen canvas.
2. A `THREE.CanvasTexture` is compiled with `sRGBColorSpace` and `needsUpdate = true`.
3. The texture maps directly onto the corresponding mesh material without reloading or flickering.

### B. Logo Upload & Decal Placement
* Supports PNG, JPG, SVG, and WebP formats.
* Real-time file validation (format check, max 6MB file size constraint).
* Provides visual upload preview, sample logo presets (Summit Outdoor, TechNova), opacity controls, scale sliders (30% to 250%), and coordinate sliders.
* Interactive drag-and-drop repositioning with corner resize handles and rotation handle.

### C. Custom Text Editor
* Add, edit, and position custom marketing slogans, URLs, and phone numbers.
* Multiple font families: **Inter**, **Montserrat**, **Oswald**, **Arial**, and **Georgia**.
* Configurable font size (16px to 72px), ink color palette, bold toggle, and text alignment (left, center, right).

### D. Dynamic Pricing Engine & Mock Express API (INR Currency)
* **Default Currency**: Indian Rupee (`INR` / `₹`) using JavaScript `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`.
* **Backend Endpoint**: `POST http://127.0.0.1:5001/api/pricing/calculate`
* **Health Check**: `GET http://127.0.0.1:5001/api/health`
* **Validation**: Rejects invalid payloads with HTTP 400 and structured error responses.
* **Demonstration Pricing Rates**:
  * **Base Canopy**: 10x10 (₹18,999), 10x15 (₹26,999), 10x20 (₹34,999)
  * **Frame Finish**: Anodized Silver (Included - ₹0), Matte Black (+₹1,800), Powder White (+₹1,400)
  * **Sidewalls**: Solid (+₹2,499), Cathedral Window (+₹3,299), Roll-up Door (+₹3,799)
  * **Custom Prints**: First plate setup (+₹1,800), subsequent element (+₹800)
  * **Accessories**: Weight Plates 4-Pack (+₹2,499), Roller Bag (+₹1,999), Stake Kit (+₹1,199), LED Lighting (+₹3,199)
  * **Tax**: Standard 18% GST (Goods and Services Tax in India)
* **Resilient Offline Fallback**: If the Express backend is not running or unreachable, the frontend automatically falls back to the exact same centralized client pricing engine without interrupting the user.

### E. Shopify Mock Cart Integration
* Implemented in a dedicated service module: `src/services/cartService.ts`.
* Formats line items into standard Shopify Storefront LineItem schema (SKU, title, price, quantity, configuration attributes, and 3D thumbnail preview).
* Slide-over cart drawer with quantity adjustments, item removal, and simulated checkout modal.

### F. Vector PDF Quotation Generator
* Generates downloadable spec sheets using **jsPDF** (`src/utils/generatePDF.ts`).
* Includes product overview, footprint dimensions, selected frame finish, fabric colors, detailed sidewall enclosure specs, branding elements list, itemized price breakdown, and final total.

### G. iFrame Embedding & Zero-Dependency Styling
* Fully responsive layout with independent CSS scoping.
* Modal in the navigation bar provides one-click iframe embedding snippet for external e-commerce sites:
  ```html
  <iframe 
    src="https://your-configurator-domain.com" 
    width="100%" 
    height="750px" 
    style="border: none; border-radius: 12px; overflow: hidden;" 
    allow="fullscreen" 
    title="3D Tent Configurator">
  </iframe>
  ```

---

## 4. Project Directory Structure

```
3D project/
├── public/
│   ├── assets/
│   │   └── logos/              # Sample SVG/PNG branding assets
│   └── models/
│       └── tent.glb            # Commercial Pop-Up Tent 3D Binary Asset
├── scripts/
│   ├── generateTentModel.js    # Procedural 3D Pop-Up Canopy Tent GLB generator
│   └── inspectModel.js         # Inspection & node hierarchy validation script
├── server/
│   └── index.js                # Express Mock Dynamic Pricing API server
├── src/
│   ├── components/
│   │   ├── cart/
│   │   │   └── ShopifyCartDrawer.tsx      # Shopify slide-over cart drawer
│   │   ├── customization/
│   │   │   ├── ColorOptions.tsx           # Fabric colors & modular sidewall styles
│   │   │   ├── CustomizationSidebar.tsx   # Left panel container & tab manager
│   │   │   ├── GeneralOptions.tsx         # Footprint size, frame finish & accessories
│   │   │   ├── LogoUploader.tsx           # File upload & logo adjustment controls
│   │   │   └── TextEditor.tsx             # Typography, font size & alignment controls
│   │   ├── editor/
│   │   │   └── DesignCanvas2D.tsx         # Interactive 2D drag/resize/rotate studio
│   │   ├── layout/
│   │   │   └── Navbar.tsx                 # Header, embed code modal, cart badge
│   │   ├── pricing/
│   │   │   └── ConfigurationSummary.tsx   # Right panel order quotation & action CTAs
│   │   └── viewer/
│   │       └── TentViewer3D.tsx           # Three.js R3F canvas, OrbitControls & presets
│   ├── services/
│   │   ├── cartService.ts                 # Mock Shopify cart state & persistence
│   │   ├── pricingApi.ts                  # Backend API client with offline fallback
│   │   └── pricingCalculation.ts          # Centralized pricing mathematical logic
│   ├── types/
│   │   └── configurator.ts                # TypeScript interfaces & domain types
│   ├── utils/
│   │   ├── constants.ts                   # Color swatches, fonts, sizes & defaults
│   │   ├── generatePDF.ts                 # jsPDF quotation generation utility
│   │   ├── modelUtils.ts                  # GLTF mesh identification & sync logic
│   │   └── textureGenerator.ts            # HTML5 Canvas texture rendering pipeline
│   ├── App.tsx                            # Root 3-column application layout
│   ├── index.css                          # Tailwind CSS styling
│   └── main.tsx                           # React 18 DOM mount point
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 5. Getting Started & Running the Application

### Prerequisites
* **Node.js** (v18.0.0 or higher recommended; developed and tested on Node v24)
* **npm** (v9+ or v11+)

### Installation
```bash
# Install dependencies
npm install
```

### Running the Application

To run the complete application (Vite Dev Server + Express Pricing API concurrently):
```bash
npm run dev:all
```

Or run the frontend and mock backend independently:
```bash
# Terminal 1: Start Express Pricing API on http://127.0.0.1:5001
npm run server

# Terminal 2: Start Vite Dev Server on http://localhost:5173
npm run dev
```

### Production Build
```bash
npm run build
```
Generates an optimized, tree-shaken static bundle in `dist/`.

---

## 6. Testing & Validation Checklist

* [x] **Asset Verification**: `tent.glb` inspected via `scripts/inspectModel.js` and loads cleanly in Three.js.
* [x] **Camera & Orbit Controls**: Rotate, pan, zoom, boundary clamping (prevents underground clipping), and camera angle presets (Isometric, Front, Top-Down, Walk-In) all functional.
* [x] **Real-time Color Customization**: Canopy roof, valance borders, and individual sidewalls update instantly on 3D meshes.
* [x] **Logo & Custom Text Upload**: PNG/SVG logos and custom typography render directly on the 3D surface using canvas texture mapping.
* [x] **2D Studio & 3D Synchronization**: Drag, resize, rotate, and delete in 2D canvas reflect live on the 3D tent model.
* [x] **Dynamic Pricing Engine**: Centralized calculation for base models, frame finishes, wall enclosures, and custom print plate fees.
* [x] **Shopify Mock Cart**: Line-item properties, SKU, item thumbnail, quantity selectors, and checkout flow tested.
* [x] **PDF Spec Sheet**: Downloadable formatted PDF generated with jsPDF.
* [x] **Responsive Layout**: Desktop 3-column layout, tablet adaptive layout, and mobile tabbed navigation verified.

