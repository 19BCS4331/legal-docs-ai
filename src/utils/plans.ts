/**
 * Shared plan configuration for the application
 * This file is used by both the pricing component and API routes
 */

export interface Plan {
  name: string;
  id: string;
  priceMonthly: string;
  description: string;
  features: string[];
  documentsPerMonth: number;
  amount: number;
  isPopular?: boolean;
}

// Credit purchase configuration
export const CREDIT_PRICE_PER_UNIT = 20; // ₹20 per credit
export const CREDIT_PURCHASE_OPTIONS = [
  { amount: 5, price: 5 * CREDIT_PRICE_PER_UNIT },
  { amount: 10, price: 10 * CREDIT_PRICE_PER_UNIT },
  { amount: 20, price: 20 * CREDIT_PRICE_PER_UNIT },
  { amount: 50, price: 50 * CREDIT_PRICE_PER_UNIT },
  { amount: 100, price: 100 * CREDIT_PRICE_PER_UNIT },
];

export const plans: Plan[] = [
  {
    name: 'Free',
    id: 'free',
    priceMonthly: '₹0',
    description: 'Perfect for trying out our service',
    features: [
      '3 documents per month',
      'Basic templates',
      'Email support',
      'PDF export',
      'Basic AI analysis',
      'Standard OCR',
      '2 GB storage',
      'Community forums'
    ],
    documentsPerMonth: 3,
    amount: 0,
  },
  {
    name: 'Pro',
    id: 'pro',
    priceMonthly: '₹999',
    description: 'For professionals and small businesses',
    features: [
      '100 documents per month',
      'All templates',
      'Priority support',
      'PDF & Word export',
      'Advanced AI analysis',
      'Enhanced OCR',
      '20 GB storage',
      'API access (100 calls/month)',
      'Custom branding',
      'Collaboration tools'
    ],
    documentsPerMonth: 100,
    amount: 999,
    isPopular: true,
  },
  {
    name: 'Enterprise',
    id: 'enterprise',
    priceMonthly: '₹4999',
    description: 'For large organizations',
    features: [
      '250 documents per month',
      'Custom templates',
      '24/7 phone support',
      'All export formats',
      'Premium AI features',
      'Premium OCR',
      'Unlimited storage',
      'Unlimited API access',
      'SSO & Team management',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee'
    ],
    documentsPerMonth: 250,
    amount: 4999,
  },
];

/**
 * Get the number of documents per month for a specific plan
 * @param planId The ID of the plan
 * @returns The number of documents per month for the plan
 */
export function getDocumentsPerMonth(planId: string): number {
  const plan = plans.find(p => p.id === planId);
  return plan?.documentsPerMonth || 0;
}

/**
 * Get the full plan details for a specific plan
 * @param planId The ID of the plan
 * @returns The plan details or undefined if not found
 */
export function getPlan(planId: string): Plan | undefined {
  return plans.find(p => p.id === planId);
}
