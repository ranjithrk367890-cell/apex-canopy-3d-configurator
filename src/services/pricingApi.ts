import { TentConfiguration, PricingBreakdown } from '../types/configurator';
import { calculateConfigurationPricing } from './pricingCalculation';

// In production, use environment variable or relative '/api' endpoint for same-origin serverless deployment.
// In development, Vite dev proxy routes '/api' to local Express server (port 5001).
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export async function fetchPricingCalculation(config: TentConfiguration): Promise<PricingBreakdown> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    const endpoint = `${API_BASE_URL}/api/pricing/calculate`;
    const response = await fetch(endpoint, {
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
