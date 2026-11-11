import { TentConfiguration, PricingBreakdown } from '../types/configurator';
import { TENT_SIZES, FRAME_FINISHES, INR_PRICING } from '../utils/constants';

export function calculateConfigurationPricing(config: TentConfiguration): PricingBreakdown {
  const lineItems: Array<{ name: string; description: string; amount: number }> = [];

  // 1. Base Product Price
  const selectedSize = TENT_SIZES.find(s => s.id === config.size) || TENT_SIZES[0];
  const basePrice = selectedSize.basePrice;
  lineItems.push({
    name: `Commercial Pop-Up Canopy (${selectedSize.label})`,
    description: `Heavy-duty commercial grade tent frame with 600D UV-treated polyester canopy`,
    amount: basePrice,
  });

  // 2. Frame Finish Surcharge
  const selectedFrame = FRAME_FINISHES.find(f => f.id === config.frameFinish) || FRAME_FINISHES[0];
  const frameFinishSurcharge = selectedFrame.surcharge;
  if (frameFinishSurcharge > 0) {
    lineItems.push({
      name: `Frame Finish Upgrade: ${selectedFrame.name}`,
      description: `Scratch-resistant electrostatically coated finish`,
      amount: frameFinishSurcharge,
    });
  }

  // 3. Walls Charges
  let wallsPrice = 0;
  const wallKeys: Array<keyof typeof config.walls> = ['front', 'back', 'left', 'right'];
  wallKeys.forEach(side => {
    const wall = config.walls[side];
    if (wall.enabled) {
      let cost = INR_PRICING.walls.solid;
      let styleDesc = 'Solid Full Wall';
      if (wall.style === 'window') {
        cost = INR_PRICING.walls.window;
        styleDesc = 'Clear Cathedral Window Wall';
      } else if (wall.style === 'door') {
        cost = INR_PRICING.walls.door;
        styleDesc = 'Heavy Duty Dual-Zipper Roll-up Door Wall';
      }
      wallsPrice += cost;
      lineItems.push({
        name: `${side.charAt(0).toUpperCase() + side.slice(1)} Sidewall (${styleDesc})`,
        description: `Weather-resistant zippered panel in ${wall.color}`,
        amount: cost,
      });
    }
  });

  // 4. Custom Printing Charges (Logo and text elements across all printable surfaces)
  let customPrintPrice = 0;
  Object.entries(config.surfaceDesigns).forEach(([surfaceKey, elements]) => {
    if (elements && elements.length > 0) {
      // First element on a surface incurs setup & plate fee, subsequent elements have lower run charge
      const surfaceCharge = INR_PRICING.printing.initialPlate + (elements.length - 1) * INR_PRICING.printing.additionalElement;
      customPrintPrice += surfaceCharge;
      lineItems.push({
        name: `Custom Dye-Sublimation Print: ${surfaceKey}`,
        description: `${elements.length} design element(s) (logos/text) printed with UV-resistant ink`,
        amount: surfaceCharge,
      });
    }
  });

  // 5. Accessories Charges
  let accessoriesPrice = 0;
  if (config.accessories.weightPlates) {
    const cost = INR_PRICING.accessories.weightPlates;
    accessoriesPrice += cost;
    lineItems.push({
      name: 'Cast-Iron Weight Plate Set (4-Pack)',
      description: '28 lbs total anchoring ballast for high wind stability',
      amount: cost,
    });
  }
  if (config.accessories.wheeledRollerBag) {
    const cost = INR_PRICING.accessories.wheeledRollerBag;
    accessoriesPrice += cost;
    lineItems.push({
      name: 'Heavy-Duty Roller Bag with All-Terrain Wheels',
      description: 'Reinforced 1680D polyester transport bag',
      amount: cost,
    });
  }
  if (config.accessories.heavyDutyStakeKit) {
    const cost = INR_PRICING.accessories.heavyDutyStakeKit;
    accessoriesPrice += cost;
    lineItems.push({
      name: 'Steel Spiral Stake & Guy Rope Kit',
      description: '4x ground auger stakes with cam-lock tension straps',
      amount: cost,
    });
  }
  if (config.accessories.ledTentLightSystem) {
    const cost = INR_PRICING.accessories.ledTentLightSystem;
    accessoriesPrice += cost;
    lineItems.push({
      name: 'Ultra-Bright LED Truss Lighting Kit',
      description: 'Rechargeable clip-on LED light bars with remote control',
      amount: cost,
    });
  }

  // Subtotal & GST Tax (Configurable Indian GST standard at 18%)
  const subtotal = basePrice + frameFinishSurcharge + wallsPrice + customPrintPrice + accessoriesPrice;
  const estimatedTax = Math.round(subtotal * INR_PRICING.gstRate * 100) / 100;
  const total = Math.round((subtotal + estimatedTax) * 100) / 100;

  return {
    basePrice,
    sizeSurcharge: 0,
    frameFinishSurcharge,
    wallsPrice,
    customPrintPrice,
    accessoriesPrice,
    subtotal,
    estimatedTax,
    total,
    currency: 'INR',
    lineItems,
  };
}

