import { useState, useEffect, useRef } from 'react';
import { TentConfiguration, PricingBreakdown, ShopifyCartState } from './types/configurator';
import { DEFAULT_CONFIGURATION } from './utils/constants';
import { fetchPricingCalculation } from './services/pricingApi';
import { ShopifyMockCartService } from './services/cartService';
import { generateConfigurationPDF } from './utils/generatePDF';

// Components
import { Navbar } from './components/layout/Navbar';
import { CustomizationSidebar } from './components/customization/CustomizationSidebar';
import { TentViewer3D, TentViewerHandle } from './components/viewer/TentViewer3D';
import { DesignCanvas2D } from './components/editor/DesignCanvas2D';
import { ConfigurationSummary } from './components/pricing/ConfigurationSummary';
import { ShopifyCartDrawer } from './components/cart/ShopifyCartDrawer';

// Icons
import { SlidersHorizontal, Eye, FileText, Layers, X } from 'lucide-react';

export function App() {
  const [config, setConfig] = useState<TentConfiguration>(DEFAULT_CONFIGURATION);
  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState<boolean>(true);
  const [cartState, setCartState] = useState<ShopifyCartState>(ShopifyMockCartService.getState());
  const [show2DEditor, setShow2DEditor] = useState<boolean>(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState<boolean>(false);

  // Mobile view tab state: 'customize' | 'preview' | 'summary'
  const [mobileTab, setMobileTab] = useState<'customize' | 'preview' | 'summary'>('preview');

  const viewerRef = useRef<TentViewerHandle>(null);

  // Subscribe to Shopify cart updates
  useEffect(() => {
    return ShopifyMockCartService.subscribe(setCartState);
  }, []);

  // Fetch updated dynamic pricing whenever configuration changes (with 250ms debounce)
  useEffect(() => {
    setIsLoadingPrice(true);
    const timer = setTimeout(() => {
      fetchPricingCalculation(config)
        .then((res) => {
          setPricing(res);
          setIsLoadingPrice(false);
        })
        .catch((err) => {
          console.error('Pricing calculation failed:', err);
          setIsLoadingPrice(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [config]);

  // Add to Shopify Cart handler
  const handleAddToCart = () => {
    if (!pricing) return;
    const snapshot = viewerRef.current?.captureSnapshot() || '';
    ShopifyMockCartService.addToCart(config, pricing, snapshot);
  };

  // Download PDF handler
  const handleDownloadPDF = async () => {
    if (!pricing) return;
    setIsDownloadingPDF(true);
    try {
      const snapshot = viewerRef.current?.captureSnapshot() || '';
      await generateConfigurationPDF(config, pricing, snapshot);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleResetConfig = () => {
    setConfig(DEFAULT_CONFIGURATION);
    viewerRef.current?.resetCamera();
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 font-sans">
      {/* Top Navigation */}
      <Navbar
        onResetConfig={handleResetConfig}
        show2DEditor={show2DEditor}
        onToggle2DEditor={() => setShow2DEditor(!show2DEditor)}
        cartState={cartState}
      />

      {/* Main 3-Column Studio Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT COLUMN: Customization Controls (Desktop: visible; Mobile: conditional) */}
        <aside
          className={`w-full lg:w-[360px] xl:w-[380px] flex-shrink-0 h-full z-20 transition-all ${
            mobileTab === 'customize' ? 'block' : 'hidden lg:block'
          }`}
        >
          <CustomizationSidebar
            config={config}
            onChange={setConfig}
            onOpen2DStudio={() => setShow2DEditor(true)}
          />
        </aside>

        {/* CENTER COLUMN: 3D Product Viewer & Dockable 2D Design Studio */}
        <main
          className={`flex-1 flex flex-col h-full min-w-0 relative ${
            mobileTab === 'preview' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Main 3D Interactive Viewport */}
          <div className="flex-1 w-full h-full relative overflow-hidden">
            <TentViewer3D
              ref={viewerRef}
              config={config}
              show2DEditorOverlay={show2DEditor}
              onToggle2DEditor={() => setShow2DEditor(!show2DEditor)}
            />
          </div>

          {/* Docked 2D Design Studio (Collapsible bottom drawer in Center area) */}
          {show2DEditor && (
            <div className="h-[360px] lg:h-[400px] w-full bg-slate-900 border-t border-slate-700 p-3 shadow-2xl relative z-20 flex flex-col">
              <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Interactive 2D Design & Decal Placement Canvas
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShow2DEditor(false)}
                  className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
                  title="Close 2D Studio"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-hidden">
                <DesignCanvas2D config={config} onChange={setConfig} />
              </div>
            </div>
          )}
        </main>

        {/* RIGHT COLUMN: Order Summary & Dynamic Pricing (Desktop: visible; Mobile: conditional) */}
        <aside
          className={`w-full lg:w-[340px] xl:w-[360px] flex-shrink-0 h-full z-20 transition-all ${
            mobileTab === 'summary' ? 'block' : 'hidden lg:block'
          }`}
        >
          <ConfigurationSummary
            config={config}
            pricing={pricing}
            isLoadingPrice={isLoadingPrice}
            onAddToCart={handleAddToCart}
            onDownloadPDF={handleDownloadPDF}
            isDownloadingPDF={isDownloadingPDF}
          />
        </aside>
      </div>

      {/* Mobile Bottom Tab Navigation (Only visible on small/medium screens) */}
      <nav className="lg:hidden h-14 bg-white border-t border-slate-200 flex items-center justify-around z-30 select-none shadow-lg">
        <button
          type="button"
          onClick={() => setMobileTab('customize')}
          className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold ${
            mobileTab === 'customize' ? 'text-sky-600' : 'text-slate-500'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Customize</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('preview')}
          className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold ${
            mobileTab === 'preview' ? 'text-sky-600' : 'text-slate-500'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>3D View</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('summary')}
          className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold ${
            mobileTab === 'summary' ? 'text-sky-600' : 'text-slate-500'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Summary & Price</span>
        </button>
      </nav>

      {/* Shopify Slide-over Cart Drawer */}
      <ShopifyCartDrawer />
    </div>
  );
}

export default App;
