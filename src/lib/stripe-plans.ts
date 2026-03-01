// Stripe price and product ID mappings for all DataAfro plans

type PlanInfo = { priceId: string; productId: string; credits: number; amount: number };
type TierMap = Record<number, PlanInfo>;

export const STRIPE_PLANS: Record<string, Record<string, TierMap>> = {
  pro: {
    monthly: {
      150: { priceId: "price_1T6AhyFYsuwBWi2qoubcOba3", productId: "prod_U4JKCymCiieWVL", credits: 150, amount: 23 },
      400: { priceId: "price_1T6Ai3FYsuwBWi2qTdZU80CQ", productId: "prod_U4JKcCjfKC18Hb", credits: 400, amount: 50 },
      1000: { priceId: "price_1T6Ai4FYsuwBWi2qiB0NszKC", productId: "prod_U4JKQGl24beZq2", credits: 1000, amount: 100 },
    },
    annual: {
      150: { priceId: "price_1T6AiBFYsuwBWi2q4TdnAZcC", productId: "prod_U4JK1orDaD6hAc", credits: 150, amount: 18 },
      400: { priceId: "price_1T6AiCFYsuwBWi2qRlorsgT9", productId: "prod_U4JKYbUPRtYzyH", credits: 400, amount: 40 },
      1000: { priceId: "price_1T6AiDFYsuwBWi2q7jqo7anN", productId: "prod_U4JKgnpUTmqzWk", credits: 1000, amount: 80 },
    },
  },
  business: {
    monthly: {
      200: { priceId: "price_1T6Ai5FYsuwBWi2q7MzR6eOk", productId: "prod_U4JKC7hs23WBSJ", credits: 200, amount: 50 },
      500: { priceId: "price_1T6Ai6FYsuwBWi2qX5mezIgq", productId: "prod_U4JKjKpvnpVbpp", credits: 500, amount: 100 },
      1500: { priceId: "price_1T6Ai7FYsuwBWi2qLj4qxjA7", productId: "prod_U4JKloAorYAufC", credits: 1500, amount: 250 },
    },
    annual: {
      200: { priceId: "price_1T6AiEFYsuwBWi2qdocaAaNC", productId: "prod_U4JKyDom2NQxhu", credits: 200, amount: 40 },
      500: { priceId: "price_1T6AiFFYsuwBWi2qfQmie8Sy", productId: "prod_U4JKbjoS5gyNys", credits: 500, amount: 80 },
      1500: { priceId: "price_1T6AiGFYsuwBWi2qCq10v1un", productId: "prod_U4JKfQhfvgLedV", credits: 1500, amount: 200 },
    },
  },
};

// Reverse lookup: find plan details from a price or product ID
export function getPlanFromPriceId(priceId: string) {
  for (const [planName, cycles] of Object.entries(STRIPE_PLANS)) {
    for (const [cycle, tiers] of Object.entries(cycles)) {
      for (const [credits, plan] of Object.entries(tiers)) {
        if (plan.priceId === priceId) {
          return { plan: planName, cycle, credits: Number(credits), ...plan };
        }
      }
    }
  }
  return null;
}

export function getPlanFromProductId(productId: string) {
  for (const [planName, cycles] of Object.entries(STRIPE_PLANS)) {
    for (const [cycle, tiers] of Object.entries(cycles)) {
      for (const [credits, plan] of Object.entries(tiers)) {
        if (plan.productId === productId) {
          return { plan: planName, cycle, credits: Number(credits), ...plan };
        }
      }
    }
  }
  return null;
}
