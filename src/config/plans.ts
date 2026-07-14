// Subscription plan catalogue (mock; no real billing is wired up).

import type { SubscriptionPlan } from "@/types/billing";

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "plan_family",
    tier: "family",
    name: "Family",
    description: "For a single family managing consolidated wealth.",
    priceInr: 0,
    billingCycle: "annual",
    features: [
      "brokerHub",
      "mutualFunds",
      "bankBalances",
      "tallySync",
      "insuranceVault",
      "aiDesk",
      "documentVault",
      "taxCentre",
      "workflow",
      "masterData",
    ],
    limits: {
      maxUsers: 5,
      maxEntities: 10,
      maxConnectors: 6,
      auditRetentionMonths: 24,
    },
  },
  {
    id: "plan_office",
    tier: "office",
    name: "Family Office",
    description: "For multi-entity family offices with governance controls.",
    priceInr: 0,
    billingCycle: "annual",
    features: [
      "brokerHub",
      "mutualFunds",
      "bankBalances",
      "tallySync",
      "insuranceVault",
      "aiDesk",
      "documentVault",
      "taxCentre",
      "workflow",
      "masterData",
      "billing",
      "ssoEnforcement",
    ],
    limits: {
      maxUsers: 25,
      maxEntities: 50,
      maxConnectors: 12,
      auditRetentionMonths: 60,
    },
  },
  {
    id: "plan_enterprise",
    tier: "enterprise",
    name: "Enterprise",
    description: "For multi-family offices and institutions; custom pricing.",
    priceInr: 0,
    billingCycle: "annual",
    features: [
      "brokerHub",
      "mutualFunds",
      "bankBalances",
      "tallySync",
      "insuranceVault",
      "aiDesk",
      "documentVault",
      "taxCentre",
      "workflow",
      "masterData",
      "billing",
      "ssoEnforcement",
      "controlledTrading",
      "liveConnectors",
    ],
    limits: {
      maxUsers: -1,
      maxEntities: -1,
      maxConnectors: -1,
      auditRetentionMonths: 120,
    },
  },
];

export function getPlan(
  tier: SubscriptionPlan["tier"],
): SubscriptionPlan | undefined {
  return subscriptionPlans.find((p) => p.tier === tier);
}

export function getPlanById(id: string): SubscriptionPlan | undefined {
  return subscriptionPlans.find((p) => p.id === id);
}
