import type { ImportedTrade } from "@/lib/portfolio/types";

type Required = Pick<
  ImportedTrade,
  "tradeId" | "tradeDateTime" | "buySell" | "quantity" | "price"
>;

/** Build an ImportedTrade with sensible test defaults; override as needed. */
export function imported(p: Partial<ImportedTrade> & Required): ImportedTrade {
  return {
    tenantId: "tnt_test",
    familyMemberId: "mem_1",
    panId: "pan_1",
    brokerAccountId: "bacc_1",
    clientCode: "CLIENT1",
    accountOwner: "Tester",
    exchange: "NSE",
    tradingSymbol: "TEST",
    isin: "INTEST0001",
    orderId: `ORD-${p.tradeId}`,
    productType: "DELIVERY",
    source: "mock",
    ...p,
  };
}
