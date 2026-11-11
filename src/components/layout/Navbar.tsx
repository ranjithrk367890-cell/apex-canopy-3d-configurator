import React, { useState } from 'react';
import { ShopifyCartState } from '../../types/configurator';
import { ShopifyMockCartService } from '../../services/cartService';
import {
  ShoppingCart,
  Layers,
  RotateCcw,
  Code2,
  HelpCircle,
  Tent,
  X
} from 'lucide-react';

interface NavbarProps {
  onResetConfig: () => void;
  show2DEditor: boolean;
  onToggle2DEditor: () => void;
  cartState: ShopifyCartState;
}

export const Navbar: React.FC<NavbarProps> = ({
  onResetConfig,
  show2DEditor,
  onToggle2DEditor,
  cartState
}) => {
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [showSpecsModal, setShowSpecsModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const embedCode = `<iframe 
  src="${window.location.origin}" 
  width="100%" 
  height="750px" 
  style="border: none; border-radius: 12px; overflow: hidden;" 
  allow="fullscreen" 
  title="3D Tent Configurator">
</iframe>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-5 flex items-center justify-between z-30 select-none shadow-xs">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-700 to-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-600/20">
          <Tent className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-extrabold text-slate-900 tracking-tight">ApexCanopy 3D</h1>
            <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-sky-100 text-sky-800 rounded tracking-wide uppercase">
              Pro Configurator
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Commercial Pop-Up Canopy Customization Platform</p>
        </div>
      </div>

      {/* Center Quick Navigation / Controls */}
      <div className="hidden md:flex items-center gap-2">
        <button
          type="button"
          onClick={onToggle2DEditor}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            show2DEditor
              ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{show2DEditor ? 'Split View (3D + 2D)' : 'Open 2D Studio'}</span>
        </button>

        <button
          type="button"
          onClick={onResetConfig}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
          title="Reset to Default Configuration"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>

        <button
          type="button"
          onClick={() => setShowEmbedModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
          title="Get iframe embed code"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Embed / iFrame</span>
        </button>

        <button
          type="button"
          onClick={() => setShowSpecsModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
          title="Technical Documentation"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Specs</span>
        </button>
      </div>

      {/* Right Actions: Shopify Cart Trigger */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => ShopifyMockCartService.openCart()}
          className="relative flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md transition-all text-xs font-bold"
        >
          <ShoppingCart className="w-4 h-4 text-sky-400" />
          <span className="hidden sm:inline">Shopify Cart</span>
          {cartState.totalCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-sky-500 text-white text-[11px] font-black flex items-center justify-center -mr-1">
              {cartState.totalCount}
            </span>
          )}
        </button>
      </div>

      {/* Embed Modal */}
      {showEmbedModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">Embed Configurator via iFrame</h3>
              </div>
              <button onClick={() => setShowEmbedModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              The 3D Product Configurator is completely responsive and self-contained with zero parent CSS dependencies. Copy this code into your e-commerce product page:
            </p>

            <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto select-all">
              {embedCode}
            </pre>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">Supports responsive desktop & mobile viewing</span>
              <button
                type="button"
                onClick={copyEmbedCode}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                {copiedCode ? 'Copied to Clipboard!' : 'Copy Embed Code'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Specs / Architecture Modal */}
      {showSpecsModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Technical Assessment Architecture</h3>
              <button onClick={() => setShowSpecsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-800">1. Real 3D GLB Integration:</p>
                <p className="mt-0.5">Commercial 10x10 Pop-Up Tent binary GLB with separated components (`roof`, `valance_*`, `frame_legs`, `frame_trusses`, `wall_*`, `accessories_weights`).</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-800">2. 2D/3D Live Texture Synchronization:</p>
                <p className="mt-0.5">HTML5 Canvas API rendering pipeline. Drag/drop logos, custom text typography, and wall window/door patterns dynamically compile to Three.js `CanvasTexture` mapped directly onto the tent surface.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-800">3. Dynamic Pricing Engine & API:</p>
                <p className="mt-0.5">Centralized pricing calculation service with Express backend (`/api/pricing/calculate`) and seamless client fallback.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-800">4. Shopify Cart & jsPDF Export:</p>
                <p className="mt-0.5">Mock Shopify line-item cart with thumbnail snapshot and instant A4 vector quotation PDF download.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSpecsModal(false)}
              className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
