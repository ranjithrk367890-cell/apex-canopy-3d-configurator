import { TentConfiguration, PricingBreakdown } from '../types/configurator';
import { calculateConfigurationPricing } from './pricingCalculation';

const API_BASE_URL = 'http://127.0.0.1:5001';

export async function fetchPricingCalculation(config: TentConfiguration): Promise<PricingBreakdown> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

    const response = await fetch(`${API_BASE_URL}/api/pricing/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server returned HTTP ${response.status}`);
    }

    const data: PricingBreakdown = await response.json();
    return data;
  } catch (err) {
    // Graceful offline fallback to synchronized client-side calculation logic
    console.info('[Pricing Service] Backend API unreachable or timed out. Using centralized client pricing calculation engine:', err);
    return calculateConfigurationPricing(config);
  }
}
