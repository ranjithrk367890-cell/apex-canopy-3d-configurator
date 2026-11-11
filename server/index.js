import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// In-memory product specifications for pricing (INR demonstration rates)
const SIZES = {
  '10x10': { basePrice: 18999, label: "10' x 10' (3m x 3m)" },
  '10x15': { basePrice: 26999, label: "10' x 15' (3m x 4.5m)" },
  '10x20': { basePrice: 34999, label: "10' x 20' (3m x 6m)" }
};

const FRAME_SURCHARGES = {
  'anodized-silver': 0,
  'matte-black': 1800,
  'powder-white': 1400
};

const INR_RATES = {
  walls: {
    solid: 2499,
    window: 3299,
    door: 3799
  },
  printing: {
    initialPlate: 1800,
    additionalElement: 800
  },
  accessories: {
    weightPlates: 2499,
    wheeledRollerBag: 1999,
    heavyDutyStakeKit: 1199,
    ledTentLightSystem: 3199
  },
  gstRate: 0.18 // 18% standard GST
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Tent Configurator Pricing API', timestamp: new Date().toISOString() });
});

app.post('/api/pricing/calculate', (req, res) => {
  try {
    const config = req.body;

    if (!config || typeof config !== 'object') {
      return res.status(400).json({ error: 'Invalid configuration payload provided' });
    }

    if (!config.size || !SIZES[config.size]) {
      return res.status(400).json({ error: `Invalid or missing tent size: "${config.size}". Valid: 10x10, 10x15, 10x20` });
    }

    const selectedSize = SIZES[config.size];
    const basePrice = selectedSize.basePrice;
    const lineItems = [
      {
        name: `Commercial Pop-Up Canopy (${selectedSize.label})`,
        description: 'Commercial aircraft-grade aluminum/steel frame with 600D PU-coated canopy',
        amount: basePrice
      }
    ];

    // Frame Finish
    const frameSurcharge = FRAME_SURCHARGES[config.frameFinish] ?? 0;
    if (frameSurcharge > 0) {
      lineItems.push({
        name: `Frame Finish Upgrade: ${config.frameFinish}`,
        description: 'Electrostatically bonded powder coat',
        amount: frameSurcharge
      });
    }

    // Walls
    let wallsPrice = 0;
    if (config.walls && typeof config.walls === 'object') {
      ['front', 'back', 'left', 'right'].forEach(side => {
        const wall = config.walls[side];
        if (wall && wall.enabled) {
          let cost = INR_RATES.walls.solid;
          let styleDesc = 'Solid Full Wall';
          if (wall.style === 'window') {
            cost = INR_RATES.walls.window;
            styleDesc = 'Cathedral Window Wall';
          } else if (wall.style === 'door') {
            cost = INR_RATES.walls.door;
            styleDesc = 'Dual-Zipper Entry Wall';
          }
          wallsPrice += cost;
          lineItems.push({
            name: `${side.charAt(0).toUpperCase() + side.slice(1)} Sidewall (${styleDesc})`,
            description: `Weatherproof wall panel in ${wall.color || '#F8FAFC'}`,
            amount: cost
          });
        }
      });
    }

    // Custom Printing
    let customPrintPrice = 0;
    if (config.surfaceDesigns && typeof config.surfaceDesigns === 'object') {
      Object.entries(config.surfaceDesigns).forEach(([surface, elements]) => {
        if (Array.isArray(elements) && elements.length > 0) {
          const surfaceCharge = INR_RATES.printing.initialPlate + (elements.length - 1) * INR_RATES.printing.additionalElement;
          customPrintPrice += surfaceCharge;
          lineItems.push({
            name: `Custom Dye-Sublimation Print: ${surface}`,
            description: `${elements.length} custom graphic element(s) applied with high-resolution UV print`,
            amount: surfaceCharge
          });
        }
      });
    }

    // Accessories
    let accessoriesPrice = 0;
    if (config.accessories) {
      if (config.accessories.weightPlates) {
        accessoriesPrice += INR_RATES.accessories.weightPlates;
        lineItems.push({
          name: 'Cast-Iron Weight Plate Set (4-Pack)',
          description: '28 lbs total anchoring ballast for high wind stability',
          amount: INR_RATES.accessories.weightPlates
        });
      }
      if (config.accessories.wheeledRollerBag) {
        accessoriesPrice += INR_RATES.accessories.wheeledRollerBag;
        lineItems.push({
          name: 'Heavy-Duty Roller Bag with All-Terrain Wheels',
          description: 'Reinforced 1680D polyester transport bag',
          amount: INR_RATES.accessories.wheeledRollerBag
        });
      }
      if (config.accessories.heavyDutyStakeKit) {
        accessoriesPrice += INR_RATES.accessories.heavyDutyStakeKit;
        lineItems.push({
          name: 'Steel Spiral Stake & Guy Rope Kit',
          description: '4x ground auger stakes with cam-lock tension straps',
          amount: INR_RATES.accessories.heavyDutyStakeKit
        });
      }
      if (config.accessories.ledTentLightSystem) {
        accessoriesPrice += INR_RATES.accessories.ledTentLightSystem;
        lineItems.push({
          name: 'Ultra-Bright LED Truss Lighting Kit',
          description: 'Rechargeable clip-on LED light bars with remote control',
          amount: INR_RATES.accessories.ledTentLightSystem
        });
      }
    }

    const subtotal = basePrice + frameSurcharge + wallsPrice + customPrintPrice + accessoriesPrice;
    const estimatedTax = Math.round(subtotal * INR_RATES.gstRate * 100) / 100;
    const total = Math.round((subtotal + estimatedTax) * 100) / 100;

    res.json({
      basePrice,
      sizeSurcharge: 0,
      frameFinishSurcharge: frameSurcharge,
      wallsPrice,
      customPrintPrice,
      accessoriesPrice,
      subtotal,
      estimatedTax,
      total,
      currency: 'INR',
      lineItems
    });
  } catch (err) {
    console.error('Pricing calculation error:', err);
    res.status(500).json({ error: 'Internal pricing engine calculation error', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[Pricing API] Mock Pricing Service running at http://localhost:${PORT}`);
});

