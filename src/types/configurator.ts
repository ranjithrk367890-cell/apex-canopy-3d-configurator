export type TentSize = '10x10' | '10x15' | '10x20';

export type FrameFinish = 'anodized-silver' | 'matte-black' | 'powder-white';

export type WallStyle = 'solid' | 'window' | 'door';

export type PrintableSurface =
  | 'roof-front'
  | 'valance-front'
  | 'wall-back'
  | 'wall-left'
  | 'wall-right'
  | 'wall-front';

export interface WallConfig {
  enabled: boolean;
  color: string;
  style: WallStyle;
}

export interface DesignElementBase {
  id: string;
  x: number; // percentage (0 to 100) or canvas coordinates
  y: number; // percentage (0 to 100)
  rotation: number; // degrees
  scale: number; // multiplier (0.2 to 3.0)
}

export interface LogoElement extends DesignElementBase {
  type: 'logo';
  url: string;
  name: string;
  width: number;
  height: number;
  aspectRatio: number;
  opacity: number;
}

export interface TextElement extends DesignElementBase {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: 'normal' | 'bold' | '800';
  textAlign: 'left' | 'center' | 'right';
}

export type DesignElement = LogoElement | TextElement;

export interface SurfaceDesign {
  surfaceId: PrintableSurface;
  elements: DesignElement[];
}

export interface AccessoriesConfig {
  weightPlates: boolean;
  wheeledRollerBag: boolean;
  heavyDutyStakeKit: boolean;
  ledTentLightSystem: boolean;
}

export interface TentConfiguration {
  size: TentSize;
  roofColor: string;
  roofColorName: string;
  matchValanceColor: boolean;
  valanceColor: string;
  frameFinish: FrameFinish;
  walls: {
    front: WallConfig;
    back: WallConfig;
    left: WallConfig;
    right: WallConfig;
  };
  activeSurface: PrintableSurface;
  surfaceDesigns: Record<PrintableSurface, DesignElement[]>;
  accessories: AccessoriesConfig;
}

export interface PricingBreakdown {
  basePrice: number;
  sizeSurcharge: number;
  frameFinishSurcharge: number;
  wallsPrice: number;
  customPrintPrice: number;
  accessoriesPrice: number;
  subtotal: number;
  estimatedTax: number;
  total: number;
  currency: string;
  lineItems: Array<{
    name: string;
    description: string;
    amount: number;
  }>;
}

export interface ShopifyCartItem {
  id: string;
  productId: string;
  title: string;
  sku: string;
  price: number;
  quantity: number;
  configuration: TentConfiguration;
  pricing: PricingBreakdown;
  previewThumbnail?: string;
  createdAt: string;
}

export interface ShopifyCartState {
  items: ShopifyCartItem[];
  subtotal: number;
  totalCount: number;
  isOpen: boolean;
}

