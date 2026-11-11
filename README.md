# ApexCanopy 3D Pro - Interactive Tent Product Configurator

A production-grade, enterprise 3D Product Customization platform built for commercial event tents and pop-up canopy products. Developed with **React 18**, **TypeScript**, **Three.js**, **React Three Fiber (R3F)**, **@react-three/drei**, **HTML5 Canvas API**, **jsPDF**, and **Node.js/Express**.

---

## 1. Executive Summary & Architecture

The **ApexCanopy 3D Pro Configurator** allows enterprise customers, marketing agencies, and event vendors to configure, brand, quote, and order commercial pop-up canopy tents in real-time. Changes made in either the 3D Orbit Viewport or the 2D Design Studio synchronize instantly across all components, updating live itemized pricing, Shopify cart line items, and vector PDF quotations.

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

## 2. Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | `18.3.1` | Component lifecycle, state management, hooks |
| **Language** | TypeScript | `~5.6.2` | Strict domain modeling and type safety |
| **Build Tool** | Vite | `5.4.11` | Hot module replacement, bundling, and proxying |
| **3D Rendering** | Three.js | `0.160.0` | WebGL scene graph, PBR materials, CanvasTextures |
| **React 3D Bridge** | React Three Fiber (R3F) | `8.17.14` | Declarative Three.js scene binding |
| **3D Helpers** | @react-three/drei | `9.121.4` | OrbitControls, ContactShadows, Annotations |
| **2D Canvas Studio** | HTML5 Canvas API | Native | Pixel-perfect 2D decal layout, drag, scale & rotate |
| **Vector PDF Export** | jsPDF | `2.5.2` | Client-side A4 technical specification sheet generator |
| **Styling** | Tailwind CSS | `3.4.16` | Responsive, zero-conflict styling |
| **Icons** | Lucide React | `0.468.0` | Minimalist UI iconography |
| **Mock Pricing Backend** | Node.js + Express | `4.21.2` | Standalone server + Vercel Serverless Function |
| **Testing** | Node.js Test Runner | Native | Automated unit & integration tests |

---

## 3. 3D Model Asset Inspection & Hierarchy

The application renders a true-to-scale commercial 10x10 ft (3.0m × 3.0m × 3.2m peak height) Pop-Up Canopy Tent binary asset located at `public/models/tent.glb`.

### Model Inspection Report (`tent.glb`)

| Property | Value | Notes |
| :--- | :--- | :--- |
| **Asset Format** | Binary glTF (`.glb`) | Validated with `GLTFLoader` |
| **File Size** | 100.5 KB | Optimized, low-overhead binary asset |
| **Footprint Dimensions** | $3.23\text{m} \times 3.20\text{m} \times 3.23\text{m}$ | $10\times10\text{ft}$ commercial event standard |
| **Scene Center** | $[0.00, 1.60, 0.00]$ | Bounding box: $Y \in [0.00, 3.20\text{m}]$ |
| **Default Camera Target** | $[0.00, 1.40, 0.00]$ | Isometric angle: $[4.6, 2.8, 4.6]$ |
| **Mesh Count** | 45 sub-meshes | Separated structural components |
| **UV Unwrapping** | Verified (Normals + UV coords) | Seamless 1:1 canvas texture projection |

### Component & Mesh Mapping

* **Canopy Roof (`roof`)**: 4-sided pyramid with normalized UV coordinates mapped to `material_roof` for full-canopy printing and fabric color tinting.
* **Valances (`valance_front`, `valance_back`, `valance_left`, `valance_right`)**: Eave drop borders hanging from $y=2.1\text{m}$ to $y=1.85\text{m}$. Front valance features dedicated logo & slogan printing; side valances support independent or matched color schemes.
* **Frame Legs (`frame_legs`)**: 4 telescoping square aluminum corner columns with molded footplates and leg slider brackets.
* **Scissor Trusses (`frame_trusses`)**: Accordion perimeter cross-braces, center peak mast, tension cap, and 4 corner roof rafters.
* **Modular Sidewalls (`wall_back`, `wall_left`, `wall_right`, `wall_front`)**: Independent $3.0\text{m} \times 2.1\text{m}$ panels with individual visibility toggling (`visible = true/false`), color customizer, and 3 distinct panel styles:
  * **Solid Wall**: Complete weather-resistant backdrop.
  * **Cathedral Window Wall**: 3 arched windows with transparent glass tint.
  * **Zipper Door Wall**: Dual-zipper roll-up entryway with hold straps.
* **Accessories (`accessories_weights`)**: 4 heavy-duty cast-iron weight plates positioned at corner footpads for wind stabilization.

---

## 4. Core Feature Implementations

### A. 2D and 3D Synchronization Pipeline
A bidirectional synchronization engine connects the 2D Design Studio with the WebGL 3D model:
1. When elements (logos, text, or wall patterns) are dragged, resized, or recolored, `renderSurfaceToCanvas()` draws onto an offscreen 2048x2048 canvas.
2. A `THREE.CanvasTexture` is compiled with `sRGBColorSpace` and `needsUpdate = true`.
3. The texture maps directly onto the corresponding mesh material without reloading or flickering.

### B. Logo Upload & Decal Placement
* Supports PNG, JPG, SVG, and WebP formats with format validation and a 6MB file size constraint.
* Visual upload preview, sample vector presets (Summit Outdoor, TechNova), opacity controls, scale sliders (30% to 250%), and coordinate positioning sliders.
* Interactive drag-and-drop repositioning with corner resize handles and rotation handle.

### C. Custom Text Editor
* Add, edit, and position custom marketing slogans, URLs, and phone numbers.
* Multiple font families: **Inter**, **Montserrat**, **Oswald**, **Arial**, and **Georgia**.
* Configurable font size (16px to 72px), ink color palette, bold toggle, and text alignment (left, center, right).

### D. Dynamic Pricing Engine (INR Currency)
* **Default Currency**: Indian Rupee (`INR` / `₹`) formatted via `Intl.NumberFormat('en-IN')`.
* **Centralized Logic**: Base prices, surcharges, accessories, and 18% GST (Goods and Services Tax).
* **Sample INR Commercial Rates**:
  * **Base Canopy**: 10x10 (₹18,999), 10x15 (₹26,999), 10x20 (₹34,999)
  * **Frame Finish**: Anodized Silver (Included - ₹0), Matte Black (+₹1,800), Powder White (+₹1,400)
  * **Sidewalls**: Solid (+₹2,499), Cathedral Window (+₹3,299), Roll-up Door (+₹3,799)
  * **Custom Prints**: First plate setup (+₹1,800), subsequent element (+₹800)
  * **Accessories**: Weight Plates 4-Pack (+₹2,499), Roller Bag (+₹1,999), Stake Kit (+₹1,199), LED Lighting (+₹3,199)
  * **Tax**: Standard 18% GST
* **Resilient Offline Fallback**: If the backend is unreachable or offline, the client seamlessly calculates the identical pricing using `src/services/pricingCalculation.ts`.

---

## 5. Important Notice: Shopify Mock vs. Real Shopify Integration

> [!NOTE]
> **Shopify Architecture Clarification**:
> This project implements a **Shopify-style Mock Cart Integration** to fulfill technical assessment criteria without requiring live merchant account credentials:
>
> 1. **Data Model**: Follows the Shopify Storefront API `LineItem` schema with attributes: `variantId`, `title`, `price`, `quantity`, `customAttributes` (storing size, frame finish, wall styles, print element counts), and a 3D canvas snapshot thumbnail.
> 2. **State Management**: Uses browser `LocalStorage` and a pub/sub subscription listener in `src/services/cartService.ts` to simulate cart persistence across reloads.
> 3. **Simulated Checkout**: Clicking "Proceed to Shopify Checkout" displays a simulated modal illustrating the payload that would be dispatched to a real Shopify Storefront `cartCreate` or `checkoutCreate` GraphQL mutation.
> 4. **Production Shopify Connection**: To connect to a live Shopify store, replace `ShopifyMockCartService` with Shopify's official `@shopify/hydrogen-react` or `@shopify/storefront-api-client` using your store domain and Storefront Access Token.

---

## 6. API Specifications & Endpoints

| Endpoint | Method | Payload / Params | Response | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | None | `{ status: "ok", timestamp }` | Service health status check |
| `/api/pricing/config` | `GET` | None | `{ currency, sizes, frameFinishes, rates }` | Catalog rates & constants |
| `/api/pricing/calculate` | `POST` | `TentConfiguration` JSON | `PricingBreakdown` JSON | Calculate itemized line items, GST, total |

### Sample Pricing API Request
```json
{
  "size": "10x10",
  "frameFinish": "matte-black",
  "walls": {
    "back": { "enabled": true, "color": "#F8FAFC", "style": "solid" },
    "left": { "enabled": true, "color": "#F8FAFC", "style": "window" }
  },
  "surfaceDesigns": {
    "valance-front": [{ "id": "el-1", "type": "logo" }]
  },
  "accessories": {
    "weightPlates": true
  }
}
```

### Sample Pricing API Response
```json
{
  "basePrice": 18999,
  "sizeSurcharge": 0,
  "frameFinishSurcharge": 1800,
  "wallsPrice": 5798,
  "customPrintPrice": 1800,
  "accessoriesPrice": 2499,
  "subtotal": 30896,
  "estimatedTax": 5561.28,
  "total": 36457.28,
  "currency": "INR",
  "lineItems": [ ... ]
}
```

---

## 7. Project File Structure

```
3D project/
├── api/
│   └── index.js                # Vercel Serverless Function entry point
├── public/
│   ├── assets/logos/           # Vector branding samples (Summit Outdoor, TechNova)
│   └── models/
│       └── tent.glb            # Commercial 10x10 canopy 3D model (100.5 KB)
├── scripts/
│   ├── generateTentModel.js    # Procedural 3D model generator & GLTF exporter
│   └── inspectModel.js         # Mesh validator & bounding box inspector
├── server/
│   ├── app.js                  # Shared Express app instance and pricing endpoints
│   └── index.js                # Local standalone server entry (port 5001)
├── src/
│   ├── components/
│   │   ├── cart/
│   │   │   └── ShopifyCartDrawer.tsx      # Slide-over cart drawer & mock checkout
│   │   ├── customization/
│   │   │   ├── ColorOptions.tsx           # Fabric colors & modular sidewall styles
│   │   │   ├── CustomizationSidebar.tsx   # Left panel container & tab navigation
│   │   │   ├── GeneralOptions.tsx         # Footprint size, frame finish & accessories
│   │   │   ├── LogoUploader.tsx           # Logo upload, preset selector & coordinates
│   │   │   └── TextEditor.tsx             # Text typography, color & alignment controls
│   │   ├── editor/
│   │   │   └── DesignCanvas2D.tsx         # Interactive 2D drag/resize/rotate studio
│   │   ├── layout/
│   │   │   └── Navbar.tsx                 # Header, reset, iframe embed & spec modal
│   │   ├── pricing/
│   │   │   └── ConfigurationSummary.tsx   # Live itemized quotation & actions
│   │   └── viewer/
│   │       └── TentViewer3D.tsx           # R3F scene, OrbitControls, presets & hotspots
│   ├── services/
│   │   ├── cartService.ts                 # LocalStorage mock Shopify cart service
│   │   ├── pricingApi.ts                  # REST API client with graceful fallback
│   │   └── pricingCalculation.ts          # Centralized mathematical pricing engine
│   ├── types/
│   │   └── configurator.ts                # TypeScript domain models & interfaces
│   ├── utils/
│   │   ├── constants.ts                   # Swatches, frame finishes, INR rates, fonts
│   │   ├── currency.ts                    # formatINR Intl formatter
│   │   ├── generatePDF.ts                 # jsPDF A4 vector quotation sheet export
│   │   ├── modelUtils.ts                  # GLTF mesh traverser & material binder
│   │   └── textureGenerator.ts            # HTML5 Canvas 2048x2048 texture generator
│   ├── App.tsx                            # Root 3-column layout & mobile navigation
│   ├── index.css                          # Tailwind CSS base styles
│   ├── main.tsx                           # React DOM mount point
│   └── vite-env.d.ts                      # Vite TypeScript client definitions
├── tests/
│   ├── model.test.js                      # 3D GLB integrity unit tests
│   └── pricing.test.js                    # Pricing math & Express API integration tests
├── .env.example                           # Environment configuration template
├── .gitignore                             # Secret & credential exclusion rules
├── package.json                           # Dependencies and scripts
├── vercel.json                            # Vercel deployment configuration
├── tailwind.config.js                     # Tailwind CSS theme configuration
├── tsconfig.json                          # TypeScript strict compiler options
└── vite.config.ts                         # Vite configuration with /api dev proxy
```

---

## 8. Setup & Running Locally

### Prerequisites
* **Node.js**: v18.0.0 or higher (Tested on Node v20 & v24)
* **npm**: v9.0.0 or higher

### Installation
```bash
git clone <repository-url>
cd "3D project"
npm install
```

### Running Both Frontend & Backend Concurrently
```bash
npm run dev:all
```
* **Frontend**: `http://localhost:5173/`
* **Backend API**: `http://127.0.0.1:5001/`

### Running Independently
```bash
# Terminal 1: Backend API
npm run server

# Terminal 2: Frontend UI
npm run dev
```

### Running Automated Tests
```bash
npm test
```
Executes all 8 test cases verifying Express API calculations, GST accuracy, and 3D GLB model metrics.

### Building for Production
```bash
npm run build
```
Creates an optimized, tree-shaken static production bundle in `dist/`.

---

## 9. Production Deployment Guide

### A. Deploying to Vercel (Recommended)
This repository is pre-configured for one-click Vercel deployment with serverless backend support via `vercel.json` and `api/index.js`.

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "feat: production-ready release"
   git push origin main
   ```
2. **Import into Vercel**:
   * Framework Preset: **Vite**
   * Root Directory: `./`
   * Build Command: `npm run build`
   * Output Directory: `dist`
3. **Environment Variables**:
   * `VITE_API_BASE_URL`: Leave empty (the pre-configured `vercel.json` rewrites automatically route `/api/*` to the serverless `api/index.js`).
4. **Deploy**:
   Vercel compiles the static frontend and creates a serverless function for the Express pricing API at the same domain.

### B. Deploying Backend to Render / Railway / AWS
If deploying the backend as a dedicated standalone container:
1. Deploy `server/index.js` using `npm run server` on your provider.
2. In your frontend hosting platform (e.g., Cloudflare Pages, Netlify, or Vercel), set the environment variable:
   ```env
   VITE_API_BASE_URL=https://your-backend-api.com
   ```
3. Re-run `npm run build`. The frontend will direct all pricing requests to the configured host.

---

## 10. iFrame Embedding Guide

ApexCanopy 3D Pro is engineered for zero-conflict embedding inside any third-party CMS or e-commerce platform (Shopify, WordPress, Webflow, Squarespace):

```html
<iframe 
  src="https://your-deployed-domain.com" 
  width="100%" 
  height="750px" 
  style="border: none; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);" 
  allow="fullscreen" 
  title="ApexCanopy 3D Product Configurator">
</iframe>
```

---

## 11. Known Technical Limitations & Considerations

1. **WebGL Hardware Acceleration**:
   * Optimal performance requires WebGL 2.0. On very legacy mobile GPUs or virtual machines with software rendering, 3D framerates may drop below 60fps. The scene automatically optimizes shadow maps to preserve performance.
2. **PDF Font Unicode Limitation**:
   * Built-in `jsPDF` core fonts (Helvetica) adhere to Standard 14 WinAnsiEncoding which does not contain the standalone rupee glyph (`₹`). To maintain cross-platform vector export fidelity without multi-megabyte TTF file bundle overhead, the PDF quotation explicitly headers columns as `Amount (INR)` and displays numeric amounts as `INR 18,999`, while the web UI displays `₹18,999`.
3. **Mobile Screen Orientation**:
   * On mobile screens below 768px width, the 3D viewport, 2D design canvas, and order summary transition into a tabbed navigation interface (`Customize` / `3D View` / `Summary`) to ensure touch usability and avoid UI occlusion.
