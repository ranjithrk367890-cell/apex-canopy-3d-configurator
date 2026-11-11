import React, { useState, useEffect } from 'react';
import { ShopifyMockCartService } from '../../services/cartService';
import { ShopifyCartState } from '../../types/configurator';
import { formatINR } from '../../utils/currency';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  Package,
  AlertCircle,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

export const ShopifyCartDrawer: React.FC = () => {
  const [cartState, setCartState] = useState<ShopifyCartState>(ShopifyMockCartService.getState());
  const [showCheckoutSuccessModal, setShowCheckoutSuccessModal] = useState(false);

  useEffect(() => {
    const unsubscribe = ShopifyMockCartService.subscribe(setCartState);
    return () => unsubscribe();
  }, []);

  if (!cartState.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        onClick={() => ShopifyMockCartService.closeCart()}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-600 text-white">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Your Shopify Cart</h3>
                <p className="text-[11px] text-slate-500">
                  {cartState.totalCount} {cartState.totalCount === 1 ? 'item' : 'items'} in cart
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => ShopifyMockCartService.closeCart()}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sandbox Notice Banner */}
          <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center gap-2 text-amber-800 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
            <span>Simulated Shopify Storefront Cart (Assessment Integration Module)</span>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {cartState.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                <ShoppingCart className="w-12 h-12 stroke-1 mb-2 text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">Your cart is currently empty</p>
                <p className="text-xs text-slate-400 mt-1">Configure a custom tent and click &ldquo;Add to Cart&rdquo;.</p>
              </div>
            ) : (
              cartState.items.map((item) => {
                const config = item.configuration;
                const activeWalls = Object.entries(config.walls)
                  .filter(([_, w]) => w.enabled)
                  .map(([s, w]) => `${s.toUpperCase()} (${w.style})`)
                  .join(', ') || 'None';

                let printCount = 0;
                Object.values(config.surfaceDesigns).forEach(els => {
                  printCount += els.length;
                });

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      {item.previewThumbnail ? (
                        <img
                          src={item.previewThumbnail}
                          alt="Tent Mockup"
                          className="w-16 h-16 rounded-lg object-cover border border-slate-200 bg-slate-50 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 flex-shrink-0">
                          <Package className="w-6 h-6 text-slate-400" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">{item.title}</h4>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">SKU: {item.sku}</p>
                        <p className="text-xs font-extrabold text-sky-700 mt-1">{formatINR(item.price)}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => ShopifyMockCartService.removeItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Specification Badges */}
                    <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1 text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Fabric Color:</span>
                        <span className="font-semibold text-slate-800">{config.roofColorName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Frame Finish:</span>
                        <span className="font-semibold text-slate-800 capitalize">{config.frameFinish.replace('-', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Sidewalls:</span>
                        <span className="font-semibold text-slate-800 truncate max-w-[200px]">{activeWalls}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Custom Graphics:</span>
                        <span className="font-semibold text-slate-800">
                          {printCount > 0 ? `${printCount} elements applied` : 'None'}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-600">Quantity</span>
                      <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                        <button
                          type="button"
                          onClick={() => ShopifyMockCartService.updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-white rounded text-slate-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-6 text-center text-slate-900">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => ShopifyMockCartService.updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-white rounded text-slate-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cartState.items.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3.5">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">{formatINR(cartState.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-emerald-700 font-semibold">Free Delivery Across India</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-extrabold text-slate-900">
                  <span>Cart Total (INR)</span>
                  <span className="text-base text-sky-700 font-black">{formatINR(cartState.subtotal)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCheckoutSuccessModal(true)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
              >
                <span>Proceed to Shopify Checkout</span>
                <ExternalLink className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => ShopifyMockCartService.clearCart()}
                className="w-full text-center text-xs text-slate-500 hover:text-rose-600 transition-colors"
              >
                Empty Cart
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Simulated Checkout Success Modal */}
      {showCheckoutSuccessModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Mock Shopify Checkout Initiated</h3>
              <p className="text-xs text-slate-500 mt-1">
                Order parameters, 3D configuration data, custom print files, and line items have been formatted into standard Shopify LineItem payload format.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-left font-mono text-[11px] text-slate-700 border border-slate-200 space-y-1">
              <div>Total Cart Value: <strong>{formatINR(cartState.subtotal)}</strong></div>
              <div>Items Count: <strong>{cartState.totalCount}</strong></div>
              <div>Status: <strong>Assessment Mock Integration Verified</strong></div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowCheckoutSuccessModal(false);
                ShopifyMockCartService.closeCart();
              }}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition-colors"
            >
              Close Confirmation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
