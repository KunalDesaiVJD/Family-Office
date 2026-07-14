// Connector registry. Resolves each connector to its mock or live
// implementation based on the active DATA_SOURCE (default "mock").
//
// NOTE: there is intentionally NO bank connector — bank aggregation is out of
// scope for this product.

import { DATA_SOURCE } from "@/config/dataSource";
import { getBrokerConnector } from "./broker";
import { getMutualFundConnector } from "./mutualFund";
import { getTallyConnector } from "./tally";
import { getInsuranceConnector } from "./insurance";
import { getDocumentParserConnector } from "./documentParser";
import { getMarketDataConnector } from "./marketData";

export * from "./base";
export * from "./broker";
export * from "./mutualFund";
export * from "./tally";
export * from "./insurance";
export * from "./documentParser";
export * from "./marketData";

export const connectors = {
  broker: getBrokerConnector(),
  mutualFund: getMutualFundConnector(),
  tally: getTallyConnector(),
  insurance: getInsuranceConnector(),
  documentParser: getDocumentParserConnector(),
  marketData: getMarketDataConnector(),
};

export type ConnectorRegistry = typeof connectors;

export const activeDataSource = DATA_SOURCE;
