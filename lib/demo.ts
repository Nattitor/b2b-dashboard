import type { Customer, Dataset, Plan, Transaction } from "./types";

export const DEMO_AS_OF = "2026-10-30T12:00:00.000Z";
export const demoPlans: Plan[] = [
  {
    id: "20000000-0000-4000-8000-000000000001",
    plan_name: "Starter",
    monthly_price: 49,
  },
  {
    id: "20000000-0000-4000-8000-000000000002",
    plan_name: "Growth",
    monthly_price: 149,
  },
  {
    id: "20000000-0000-4000-8000-000000000003",
    plan_name: "Scale",
    monthly_price: 499,
  },
];

const companies = [
  "Acme Studio",
  "Northstar Labs",
  "Orbit Systems",
  "Forma Design",
  "Cedar & Co.",
  "Meridian Works",
  "Atlas Supply",
  "Linear Goods",
  "Fieldwork",
  "Mono Creative",
  "Summit Digital",
  "Common Ground",
  "Arc Logistics",
  "Evergreen",
  "Brightside",
  "Tandem Studio",
  "Vela Partners",
  "Kite Commerce",
  "Slate Collective",
  "Beacon Works",
  "Aperture",
  "Wayfinder",
  "Kinfolk Supply",
  "Parallel Labs",
];
const uuid = (prefix: string, index: number) =>
  `${prefix}-0000-4000-8000-${String(index + 1).padStart(12, "0")}`;

export function createDemoDataset(): Dataset {
  const customers: Customer[] = companies.map((name, index) => ({
    id: uuid("10000000", index),
    name,
    email: `billing@${name.toLowerCase().replace(/[^a-z]/g, "")}.example`,
    created_at: new Date(
      Date.UTC(2025, 9 + Math.floor(index / 2), 2 + (index % 12)),
    ).toISOString(),
    status: index % 7 === 0 ? "Inactive" : "Active",
  }));
  const transactions: Transaction[] = [];
  for (let month = 0; month < 12; month++) {
    const size = 34 + month * 3;
    for (let index = 0; index < size; index++) {
      const customer = customers[(index + month * 3) % customers.length];
      const plan = demoPlans[(index + month) % demoPlans.length];
      const marker = (index * 7 + month) % 20;
      const createdAt = new Date(
        Date.UTC(2025, 10 + month, 1 + (index % 28), 9 + (index % 9)),
      ).toISOString();
      // Only customers acquired by this payment's date can appear in the ledger.
      if (createdAt < customer.created_at) continue;
      transactions.push({
        id: uuid("30000000", transactions.length),
        amount: plan.monthly_price,
        status: marker < 16 ? "Success" : marker < 19 ? "Pending" : "Failed",
        created_at: createdAt,
        customer: { name: customer.name, email: customer.email },
        plan: plan.plan_name,
      });
    }
  }
  return { customers, transactions };
}
