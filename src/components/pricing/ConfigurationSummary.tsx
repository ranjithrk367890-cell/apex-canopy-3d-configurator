import React, { useState } from 'react';
import { TentConfiguration, PricingBreakdown } from '../../types/configurator';
import { TENT_SIZES, FRAME_FINISHES } from '../../utils/constants';
import { formatINR } from '../../utils/currency';
import {
  ShoppingCart,
  FileDown,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';

interface ConfigurationSummaryProps {
  config: TentConfiguration;
  pricing: PricingBreakdown | null;
  isLoadingPrice: boolean;
  onAddToCart: () => void;
  onDownloadPDF: () => void;
  isDownloadingPDF: boolean;
}

export const ConfigurationSummary: React.FC<ConfigurationSummaryProps> = ({
  config,
  pricing,
  isLoadingPrice,
  onAddToCart,
  onDownloadPDF,
  isDownloadingPDF
}) => {
  const [showItemizedDetails, setShowItemizedDetails] = useState(false);

  const selectedSize = TENT_SIZES.find(s => s.id === config.size) || TENT_SIZES[0];
  const selectedFrame = FRAME_FINISHES.find(f => f.id === config.frameFinish) || FRAME_FINISHES[0];

  // Count active walls
  const activeWalls = Object.entries(config.walls)
    .filter(([_, w]) => w.enabled)
    .map(([side, w]) => `${side.toUpperCase()} (${w.style})`);

  // Count printed surfaces
  const printedSurfaces = Object.entries(config.surfaceDesigns).filter(([_, els]) => els.length > 0);

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 shadow-sm overflow-hidden select-none">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200">
        <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Order Summary</h2>
        <p className="text-xs text-slate-500">Live Itemized Quotation & Specifications</p>
      </div>

      {/* Scrollable Summary Section */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Selected Config Breakdown Cards */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Selected Configuration
          </span>

          {/* Model & Size */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">{selectedSize.label}</span>
              <span className="text-xs font-extrabold text-slate-900">{formatINR(selectedSize.basePrice)}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">{selectedSize.dimensions}</p>
          </div>

          {/* Frame Finish */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900">Frame: {selectedFrame.name}</span>
              <p className="text-[11px] text-slate-500">Aircraft-grade aluminum</p>
            </div>
            <span className="text-xs font-semibold text-slate-700">
              {selectedFrame.surcharge === 0 ? 'Included' : `+${formatINR(selectedFrame.surcharge)}`}
            </span>
          </div>

          {/* Roof & Valance Colors */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Roof Fabric: {config.roofColorName}</span>
              <div className="w-4 h-4 rounded-full border border-slate-300" style={{ backgroundColor: config.roofColor }} />
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Valance: {config.matchValanceColor ? 'Matches Canopy Roof' : config.valanceColor}
            </p>
          </div>

          {/* Sidewalls */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Modular Sidewalls</span>
              <span className="text-xs font-semibold text-slate-700">
                {pricing ? (pricing.wallsPrice > 0 ? `+${formatINR(pricing.wallsPrice)}` : '₹0') : '₹0'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              {activeWalls.length > 0 ? activeWalls.join(', ') : 'None (Open Canopy Pavilion)'}
            </p>
          </div>

          {/* Custom Branding Prints */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Custom Graphics / Prints</span>
              <span className="text-xs font-semibold text-slate-700">
                {pricing ? (pricing.customPrintPrice > 0 ? `+${formatINR(pricing.customPrintPrice)}` : '₹0') : '₹0'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              {printedSurfaces.length > 0
                ? `${printedSurfaces.map(([s]) => s).join(', ')}`
                : 'No custom prints applied'}
            </p>
          </div>

          {/* Accessories */}
          {(config.accessories.weightPlates || config.accessories.wheeledRollerBag || config.accessories.heavyDutyStakeKit || config.accessories.ledTentLightSystem) && (
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Accessories</span>
                <span className="text-xs font-semibold text-slate-700">
                  {pricing ? `+${formatINR(pricing.accessoriesPrice)}` : '₹0'}
                </span>
              </div>
              <ul className="text-[11px] text-slate-600 mt-1 list-disc list-inside space-y-0.5">
                {config.accessories.weightPlates && <li>Cast-Iron Weights (4-Pack)</li>}
                {config.accessories.wheeledRollerBag && <li>Wheeled Roller Bag</li>}
                {config.accessories.heavyDutyStakeKit && <li>Heavy-Duty Stake Kit</li>}
                {config.accessories.ledTentLightSystem && <li>LED Truss Light Kit</li>}
              </ul>
            </div>
          )}
        </div>

        {/* Itemized Price Details Toggle */}
        {pricing && pricing.lineItems.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setShowItemizedDetails(!showItemizedDetails)}
              className="w-full flex items-center justify-between py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border-t border-slate-200"
            >
              <span>View Itemized Quotation ({pricing.lineItems.length} lines)</span>
              {showItemizedDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showItemizedDetails && (
              <div className="mt-2 space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                {pricing.lineItems.map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between border-b border-slate-200/60 pb-1.5 last:border-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-slate-800">{item.name}</p>
                      <p className="text-[10px] text-slate-500">{item.description}</p>
                    </div>
                    <span className="font-bold text-slate-900 ml-2">{formatINR(item.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Sticky Pricing & Action Footer */}
      <div className="p-5 border-t border-slate-200 bg-slate-50/90 space-y-4">
        {/* Price Breakdown Summary */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-800">
              {isLoadingPrice ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (pricing ? formatINR(pricing.subtotal) : '₹0')}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>Estimated GST (18%)</span>
            <span className="font-semibold text-slate-800">
              {isLoadingPrice ? '...' : (pricing ? formatINR(pricing.estimatedTax) : '₹0')}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-slate-900">
            <span className="text-sm font-extrabold">Final Total</span>
            <div className="text-right">
              <span className="text-lg font-black text-sky-700">
                {isLoadingPrice ? <Loader2 className="w-4 h-4 animate-spin inline" /> : (pricing ? formatINR(pricing.total) : '₹0')}
              </span>
              <span className="text-[10px] text-slate-500 block font-semibold">INR (Free Delivery Across India)</span>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-2">
          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={onAddToCart}
            disabled={isLoadingPrice || !pricing}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Shopify Cart</span>
          </button>

          {/* Download PDF Button */}
          <button
            type="button"
            onClick={onDownloadPDF}
            disabled={isDownloadingPDF || !pricing}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold text-xs rounded-xl shadow-sm transition-colors"
          >
            {isDownloadingPDF ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                <span>Generating Vector PDF...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 text-slate-600" />
                <span>Download Configuration PDF</span>
              </>
            )}
          </button>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-3 pt-1 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 5-Yr Commercial Warranty
          </span>
          <span>•</span>
          <span>Fast Production Turnaround</span>
        </div>
      </div>
    </div>
  );
};
