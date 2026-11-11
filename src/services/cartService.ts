import { TentConfiguration, PricingBreakdown, ShopifyCartItem, ShopifyCartState } from '../types/configurator';

const CART_STORAGE_KEY = 'tent_configurator_shopify_cart_v1';

export class ShopifyMockCartService {
  private static cartState: ShopifyCartState = ShopifyMockCartService.loadCart();
  private static listeners: Array<(state: ShopifyCartState) => void> = [];

  private static loadCart(): ShopifyCartState {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          items: parsed.items || [],
          subtotal: parsed.subtotal || 0,
          totalCount: parsed.totalCount || 0,
          isOpen: false,
        };
      }
    } catch (e) {
      console.warn('Failed to parse cart from localStorage:', e);
    }
    return { items: [], subtotal: 0, totalCount: 0, isOpen: false };
  }

  private static saveCart() {
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({
          items: this.cartState.items,
          subtotal: this.cartState.subtotal,
          totalCount: this.cartState.totalCount,
        })
      );
    } catch (e) {
      console.warn('Failed to save cart to localStorage:', e);
    }
    this.notify();
  }

  public static subscribe(listener: (state: ShopifyCartState) => void): () => void {
    this.listeners.push(listener);
    listener(this.cartState);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notify() {
    this.listeners.forEach(fn => fn({ ...this.cartState }));
  }

  public static getState(): ShopifyCartState {
    return { ...this.cartState };
  }

  public static openCart() {
    this.cartState.isOpen = true;
    this.notify();
  }

  public static closeCart() {
    this.cartState.isOpen = false;
    this.notify();
  }

  public static toggleCart() {
    this.cartState.isOpen = !this.cartState.isOpen;
    this.notify();
  }

  /**
   * Adds the configured 3D Tent as a Shopify product line item
   */
  public static addToCart(
    config: TentConfiguration,
    pricing: PricingBreakdown,
    previewThumbnail?: string
  ): ShopifyCartItem {
    const timestamp = Date.now();
    const itemId = `tent-config-${timestamp}`;

    const newItem: ShopifyCartItem = {
      id: itemId,
      productId: 'shopify-pop-up-canopy-custom',
      title: `Custom Commercial Canopy Tent (${config.size})`,
      sku: `TENT-${config.size.toUpperCase()}-${config.frameFinish.substring(0, 3).toUpperCase()}`,
      price: pricing.total,
      quantity: 1,
      configuration: JSON.parse(JSON.stringify(config)),
      pricing: JSON.parse(JSON.stringify(pricing)),
      previewThumbnail,
      createdAt: new Date().toISOString(),
    };

    this.cartState.items.unshift(newItem);
    this.recalculateTotals();
    this.cartState.isOpen = true;
    this.saveCart();

    return newItem;
  }

  public static removeItem(itemId: string) {
    this.cartState.items = this.cartState.items.filter(item => item.id !== itemId);
    this.recalculateTotals();
    this.saveCart();
  }

  public static updateQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      this.removeItem(itemId);
      return;
    }
    const item = this.cartState.items.find(i => i.id === itemId);
    if (item) {
      item.quantity = quantity;
      this.recalculateTotals();
      this.saveCart();
    }
  }

  public static clearCart() {
    this.cartState.items = [];
    this.recalculateTotals();
    this.saveCart();
  }

  private static recalculateTotals() {
    let subtotal = 0;
    let count = 0;
    this.cartState.items.forEach(item => {
      subtotal += item.price * item.quantity;
      count += item.quantity;
    });
    this.cartState.subtotal = Math.round(subtotal * 100) / 100;
    this.cartState.totalCount = count;
  }
}
