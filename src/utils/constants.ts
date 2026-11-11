import { TentConfiguration, PrintableSurface } from '../types/configurator';

export const COLOR_PALETTE = [
  { name: 'Royal Blue', hex: '#1E3A8A', isDark: true },
  { name: 'Deep Navy', hex: '#0F172A', isDark: true },
  { name: 'Crimson Red', hex: '#DC2626', isDark: true },
  { name: 'Forest Green', hex: '#15803D', isDark: true },
  { name: 'Vibrant Orange', hex: '#EA580C', isDark: true },
  { name: 'Matte Charcoal', hex: '#18181B', isDark: true },
  { name: 'Pure White', hex: '#F8FAFC', isDark: false },
  { name: 'Sun Yellow', hex: '#EAB308', isDark: false },
  { name: 'Burgundy Wine', hex: '#831843', isDark: true },
  { name: 'Sky Cyan', hex: '#0284C7', isDark: true },
];

export const FRAME_FINISHES = [
  { id: 'anodized-silver', name: 'Anodized Silver', hex: '#94A3B8', surcharge: 0 },
  { id: 'matte-black', name: 'Pro Matte Black', hex: '#1E293B', surcharge: 1800 },
  { id: 'powder-white', name: 'Powder-Coat White', hex: '#F1F5F9', surcharge: 1400 },
];

export const TENT_SIZES = [
  { id: '10x10', label: "10' × 10' (3m × 3m)", dimensions: '3.0m × 3.0m × 3.2m', basePrice: 18999, desc: 'Ideal for trade shows, farmer markets, sporting events' },
  { id: '10x15', label: "10' × 15' (3m × 4.5m)", dimensions: '3.0m × 4.5m × 3.2m', basePrice: 26999, desc: 'Extended footprint for large vendor displays' },
  { id: '10x20', label: "10' × 20' (3m × 6m)", dimensions: '3.0m × 6.0m × 3.2m', basePrice: 34999, desc: 'Maximum coverage pavilion for high-volume crowds' },
];

// Centralized Demonstration INR Pricing Rates
export const INR_PRICING = {
  walls: {
    solid: 2499,
    window: 3299,
    door: 3799,
  },
  printing: {
    initialPlate: 1800,
    additionalElement: 800,
  },
  accessories: {
    weightPlates: 2499,
    wheeledRollerBag: 1999,
    heavyDutyStakeKit: 1199,
    ledTentLightSystem: 3199,
  },
  gstRate: 0.18, // 18% standard GST (Goods and Services Tax)
};

export const AVAILABLE_FONTS = [
  { id: 'Inter', name: 'Inter (Modern Sans)', family: 'Inter, sans-serif' },
  { id: 'Montserrat', name: 'Montserrat (Bold Display)', family: 'Montserrat, sans-serif' },
  { id: 'Oswald', name: 'Oswald (Impact Headliner)', family: 'Oswald, sans-serif' },
  { id: 'Arial', name: 'Arial (Neutral Universal)', family: 'Arial, sans-serif' },
  { id: 'Georgia', name: 'Georgia (Refined Serif)', family: 'Georgia, serif' },
];

export const PRINTABLE_SURFACES: Array<{ id: PrintableSurface; name: string; description: string; canvasAspect: number }> = [
  { id: 'roof-front', name: 'Canopy Roof (Front Face)', description: 'Prime high-visibility triangular canopy face', canvasAspect: 1.0 },
  { id: 'valance-front', name: 'Front Valance (Banner)', description: 'Horizontal eave drop banner for slogans & contact', canvasAspect: 6.0 },
  { id: 'wall-back', name: 'Back Full Wall', description: 'Large 10ft backdrop behind trade booth', canvasAspect: 1.43 },
  { id: 'wall-left', name: 'Left Sidewall', description: 'Modular side partition panel', canvasAspect: 1.43 },
  { id: 'wall-right', name: 'Right Sidewall', description: 'Modular side partition panel', canvasAspect: 1.43 },
  { id: 'wall-front', name: 'Front Wall / Door', description: 'Enclosure wall with roll-up zippered entry', canvasAspect: 1.43 },
];

export const DEFAULT_CONFIGURATION: TentConfiguration = {
  size: '10x10',
  roofColor: '#1E3A8A',
  roofColorName: 'Royal Blue',
  matchValanceColor: true,
  valanceColor: '#1E3A8A',
  frameFinish: 'anodized-silver',
  walls: {
    back: { enabled: true, color: '#F8FAFC', style: 'solid' },
    left: { enabled: false, color: '#F8FAFC', style: 'solid' },
    right: { enabled: false, color: '#F8FAFC', style: 'solid' },
    front: { enabled: false, color: '#F8FAFC', style: 'solid' },
  },
  activeSurface: 'roof-front',
  surfaceDesigns: {
    'roof-front': [
      {
        id: 'default-roof-logo',
        type: 'logo',
        url: '/assets/logos/summit_outdoor.svg',
        name: 'Summit Outdoor Logo',
        x: 50,
        y: 60,
        width: 320,
        height: 128,
        aspectRatio: 2.5,
        rotation: 0,
        scale: 1.0,
        opacity: 1.0,
      }
    ],
    'valance-front': [
      {
        id: 'default-valance-text',
        type: 'text',
        text: 'SUMMIT OUTDOOR GEAR • WWW.SUMMITGEAR.COM',
        x: 50,
        y: 50,
        fontSize: 32,
        fontFamily: 'Montserrat',
        color: '#FFFFFF',
        fontWeight: 'bold',
        textAlign: 'center',
        rotation: 0,
        scale: 1.0,
      }
    ],
    'wall-back': [],
    'wall-left': [],
    'wall-right': [],
    'wall-front': [],
  },
  accessories: {
    weightPlates: true,
    wheeledRollerBag: true,
    heavyDutyStakeKit: false,
    ledTentLightSystem: false,
  },
};

