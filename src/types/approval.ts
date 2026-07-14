// Maker-checker approval workflow types.

export type ApprovalStage =
  | "pending"
  | "awaiting_checker"
  | "approved"
  | "rejected";

export type ApprovalType =
  | "broker_link"
  | "reauthentication"
  | "document_release"
  | "trade_order"
  | "data_correction"
  | "user_invite"
  | "other";

export interface Approval {
  id: string;
  tenantId: string;
  type: ApprovalType;
  request: string;
  entity: string;
  requestedBy: string;
  amount?: number;
  stage: ApprovalStage;
  /** Initiating user (maker). */
  makerId: string;
  /** Approving user (checker), once acted upon. */
  checkerId?: string;
  raisedAt: string;
  decidedAt?: string;
  note?: string;
}
