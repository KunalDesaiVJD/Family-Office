// Broker, demat & connection domain types.

export type BrokerName =
  | "Zerodha"
  | "ICICI Direct"
  | "HDFC Securities"
  | "Kotak Securities"
  | "Angel One"
  | "Groww";

/** Shared connector state used across broker, bank and other integrations. */
export type ConnectionStatus =
  | "connected"
  | "auth_required"
  | "syncing"
  | "error"
  | "disconnected";

export type Depository = "NSDL" | "CDSL";

export interface DematAccount {
  id: string;
  tenantId: string;
  dpId: string;
  boId: string;
  depository: Depository;
}

export interface BrokerAccount {
  id: string;
  tenantId: string;
  memberId: string;
  ownerName: string;
  broker: BrokerName;
  clientCode: string;
  demat: DematAccount;
  equityValue: number;
  cashBalance: number;
  connectionStatus: ConnectionStatus;
  lastSyncedAt: string;
  /** Whether a re-authentication / OTP is pending (never store the credential). */
  pendingAuth: boolean;
}
