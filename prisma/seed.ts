// Seed the database with V J Desai Family mock data.
// Run with: npm run prisma:seed  (after `prisma migrate dev`).
// Self-contained — no app imports, so it runs cleanly under tsx.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TENANT_ID = "tnt_vjdesai";

const RESOURCES = [
  "dashboard", "family", "entities", "pan", "broker", "demat", "mutualFunds",
  "insurance", "tally", "documents", "tax", "reconciliation", "workflow", "admin",
  "billing", "audit", "trading",
];
const ACTIONS = ["view", "create", "edit", "delete", "approve", "export"];

async function main() {
  // --- Subscription plans -------------------------------------------------
  await prisma.subscriptionPlan.createMany({
    skipDuplicates: true,
    data: [
      { id: "plan_family", tier: "FAMILY", name: "Family", description: "For a single family managing consolidated wealth.", priceInr: 0, billingCycle: "ANNUAL", features: ["brokerHub", "mutualFunds", "tallySync", "insuranceVault", "documentVault", "taxCentre", "reconciliation", "workflow", "masterData"], maxUsers: 5, maxEntities: 10, maxConnectors: 6, auditRetentionMonths: 24 },
      { id: "plan_office", tier: "OFFICE", name: "Family Office", description: "For multi-entity family offices with governance controls.", priceInr: 0, billingCycle: "ANNUAL", features: ["brokerHub", "mutualFunds", "tallySync", "insuranceVault", "documentVault", "taxCentre", "reconciliation", "workflow", "masterData", "billing", "ssoEnforcement"], maxUsers: 25, maxEntities: 50, maxConnectors: 12, auditRetentionMonths: 60 },
      { id: "plan_enterprise", tier: "ENTERPRISE", name: "Enterprise", description: "For multi-family offices and institutions; custom pricing.", priceInr: 0, billingCycle: "ANNUAL", features: ["brokerHub", "mutualFunds", "tallySync", "insuranceVault", "documentVault", "taxCentre", "reconciliation", "workflow", "masterData", "billing", "ssoEnforcement", "controlledTrading", "liveConnectors"], maxUsers: -1, maxEntities: -1, maxConnectors: -1, auditRetentionMonths: 120 },
    ],
  });

  // --- Permissions --------------------------------------------------------
  const permissions = RESOURCES.flatMap((r) =>
    ACTIONS.map((a) => ({ id: `perm_${r}_${a}`, key: `${r}:${a}`, resource: r, action: a })),
  );
  await prisma.permission.createMany({ skipDuplicates: true, data: permissions });

  // --- Roles --------------------------------------------------------------
  await prisma.role.createMany({
    skipDuplicates: true,
    data: [
      { id: "role_family_admin", key: "family_admin", name: "Family Admin", description: "Full access across the family office." },
      { id: "role_trader", key: "trader", name: "Trader", description: "View portfolios and raise / place controlled trade orders." },
      { id: "role_accountant", key: "accountant", name: "Accountant", description: "Manage Tally, ledgers, documents and tax records." },
      { id: "role_viewer", key: "viewer", name: "Viewer", description: "Read-only access to consolidated wealth." },
      { id: "role_reviewer", key: "reviewer", name: "Reviewer", description: "Review and approve items and read the audit trail." },
      { id: "role_developer_support", key: "developer_support", name: "Developer Support", description: "Read-only diagnostic access for platform support." },
    ],
  });

  // --- Role → permission mapping -----------------------------------------
  const rolePerms: { id: string; roleId: string; permissionId: string }[] = [];
  const grant = (roleId: string, keys: string[]) => {
    for (const k of keys) {
      const p = permissions.find((x) => x.key === k);
      if (p) rolePerms.push({ id: `rp_${roleId}_${p.id}`, roleId, permissionId: p.id });
    }
  };
  // Family Admin — all permissions.
  for (const p of permissions) rolePerms.push({ id: `rp_role_family_admin_${p.id}`, roleId: "role_family_admin", permissionId: p.id });
  grant("role_trader", ["dashboard:view", "dashboard:export", "broker:view", "demat:view", "mutualFunds:view", "trading:view", "trading:create", "reconciliation:view"]);
  grant("role_accountant", ["dashboard:view", "dashboard:export", "tally:view", "tally:create", "tally:edit", "documents:view", "documents:create", "documents:edit", "tax:view", "tax:edit", "tax:export"]);
  grant("role_viewer", ["dashboard:view", "family:view", "entities:view", "pan:view", "broker:view", "demat:view", "mutualFunds:view", "insurance:view", "tally:view", "documents:view", "tax:view", "reconciliation:view", "workflow:view"]);
  grant("role_reviewer", ["dashboard:view", "workflow:view", "workflow:approve", "audit:view", "audit:export", "reconciliation:view"]);
  grant("role_developer_support", ["dashboard:view", "admin:view", "audit:view", "workflow:view", "reconciliation:view"]);
  await prisma.rolePermission.createMany({ skipDuplicates: true, data: rolePerms });

  // --- Tenant -------------------------------------------------------------
  await prisma.tenant.upsert({
    where: { id: TENANT_ID },
    update: {},
    create: { id: TENANT_ID, name: "V J Desai Family", slug: "vj-desai-family", plan: "FAMILY", planId: "plan_family", baseCurrency: "INR", timeZone: "Asia/Kolkata", primaryContact: "info@vjdesai.com", status: "ACTIVE" },
  });

  // --- Users --------------------------------------------------------------
  await prisma.user.createMany({
    skipDuplicates: true,
    data: [
      { id: "usr_kunal", tenantId: TENANT_ID, name: "Kunal Desai", email: "kunal@vjdesai.com", roleId: "role_family_admin", status: "ACTIVE" },
      { id: "usr_vijay", tenantId: TENANT_ID, name: "Vijay Desai", email: "vijay@vjdesai.com", roleId: "role_reviewer", status: "ACTIVE" },
      { id: "usr_neha", tenantId: TENANT_ID, name: "Neha Desai", email: "neha@vjdesai.com", roleId: "role_trader", status: "ACTIVE" },
      { id: "usr_accts", tenantId: TENANT_ID, name: "Family Accountant", email: "accounts@vjdesai.com", roleId: "role_accountant", status: "ACTIVE" },
      { id: "usr_lata", tenantId: TENANT_ID, name: "Lata Desai", email: "lata@vjdesai.com", roleId: "role_viewer", status: "ACTIVE" },
      { id: "usr_support", tenantId: TENANT_ID, name: "Platform Support", email: "support@vjdesai.com", roleId: "role_developer_support", status: "ACTIVE" },
    ],
  });

  // --- PAN profiles -------------------------------------------------------
  await prisma.panProfile.createMany({
    skipDuplicates: true,
    data: [
      { id: "pan_father", tenantId: TENANT_ID, pan: "ABCPV5678J", holderName: "Vijay Desai", holderType: "INDIVIDUAL" },
      { id: "pan_self", tenantId: TENANT_ID, pan: "ABCPK1234D", holderName: "Kunal Desai", holderType: "INDIVIDUAL" },
      { id: "pan_spouse", tenantId: TENANT_ID, pan: "ABCPN9012K", holderName: "Neha Desai", holderType: "INDIVIDUAL" },
      { id: "pan_mother", tenantId: TENANT_ID, pan: "ABCPL3456M", holderName: "Lata Desai", holderType: "INDIVIDUAL" },
      { id: "pan_pvt", tenantId: TENANT_ID, pan: "AABCC1234D", holderName: "V J Desai Ventures Pvt Ltd", holderType: "ENTITY" },
      { id: "pan_huf", tenantId: TENANT_ID, pan: "AAAHD7890N", holderName: "Desai Family HUF", holderType: "ENTITY" },
      { id: "pan_llp", tenantId: TENANT_ID, pan: "AABFC9012L", holderName: "V J Desai Advisory LLP", holderType: "ENTITY" },
      { id: "pan_trust", tenantId: TENANT_ID, pan: "AAATD3456N", holderName: "Desai Family Private Trust", holderType: "ENTITY" },
    ],
  });

  // --- Family members -----------------------------------------------------
  await prisma.familyMember.createMany({
    skipDuplicates: true,
    data: [
      { id: "mem_father", tenantId: TENANT_ID, name: "Vijay Desai", relationship: "FATHER", governanceRole: "Chairman / Patriarch", netWorth: 720000000, status: "ACTIVE", panProfileId: "pan_father", joinedAt: new Date("2025-11-02") },
      { id: "mem_self", tenantId: TENANT_ID, name: "Kunal Desai", relationship: "SELF", governanceRole: "Principal / CEO", netWorth: 486000000, status: "ACTIVE", panProfileId: "pan_self", joinedAt: new Date("2025-11-02") },
      { id: "mem_spouse", tenantId: TENANT_ID, name: "Neha Desai", relationship: "SPOUSE", governanceRole: "Director", netWorth: 118000000, status: "ACTIVE", panProfileId: "pan_spouse", joinedAt: new Date("2025-11-18") },
      { id: "mem_mother", tenantId: TENANT_ID, name: "Lata Desai", relationship: "MOTHER", governanceRole: "Trustee", netWorth: 92000000, status: "ACTIVE", panProfileId: "pan_mother", joinedAt: new Date("2025-12-04") },
      { id: "mem_huf", tenantId: TENANT_ID, name: "Desai Family HUF", relationship: "HUF", governanceRole: "Karta-managed", netWorth: 68000000, status: "ONBOARDING", panProfileId: "pan_huf", joinedAt: new Date("2026-01-15") },
    ],
  });

  // --- Legal entities -----------------------------------------------------
  await prisma.legalEntity.createMany({
    skipDuplicates: true,
    data: [
      { id: "ent_pvt", tenantId: TENANT_ID, name: "V J Desai Ventures Pvt Ltd", type: "PRIVATE_LIMITED", jurisdiction: "Maharashtra, India", incorporatedOn: new Date("2012-05-14"), panProfileId: "pan_pvt" },
      { id: "ent_huf", tenantId: TENANT_ID, name: "Desai Family HUF", type: "HUF", jurisdiction: "India", panProfileId: "pan_huf" },
      { id: "ent_llp", tenantId: TENANT_ID, name: "V J Desai Advisory LLP", type: "LLP", jurisdiction: "Maharashtra, India", incorporatedOn: new Date("2018-08-21"), panProfileId: "pan_llp" },
      { id: "ent_trust", tenantId: TENANT_ID, name: "Desai Family Private Trust", type: "TRUST", jurisdiction: "India", incorporatedOn: new Date("2016-02-10"), panProfileId: "pan_trust" },
    ],
  });

  // --- Broker + demat accounts -------------------------------------------
  await prisma.brokerAccount.createMany({
    skipDuplicates: true,
    data: [
      { id: "brk_ang_vijay", tenantId: TENANT_ID, memberId: "mem_father", ownerName: "Vijay Desai", broker: "Angel One", clientCode: "AO-VJD-001", equityValue: 182000000, cashBalance: 9000000, connectionStatus: "CONNECTED", pendingAuth: false, lastSyncedAt: new Date("2026-07-13T09:42:00+05:30") },
      { id: "brk_ang_kunal", tenantId: TENANT_ID, memberId: "mem_self", ownerName: "Kunal Desai", broker: "Angel One", clientCode: "AO-KD-002", equityValue: 96000000, cashBalance: 6500000, connectionStatus: "CONNECTED", pendingAuth: false, lastSyncedAt: new Date("2026-07-13T09:42:00+05:30") },
      { id: "brk_ang_neha", tenantId: TENANT_ID, memberId: "mem_spouse", ownerName: "Neha Desai", broker: "Angel One", clientCode: "AO-ND-003", equityValue: 41000000, cashBalance: 2200000, connectionStatus: "SYNCING", pendingAuth: false, lastSyncedAt: new Date("2026-07-13T09:20:00+05:30") },
      { id: "brk_ang_huf", tenantId: TENANT_ID, memberId: "mem_huf", ownerName: "Desai Family HUF", broker: "Angel One", clientCode: "AO-HUF-004", equityValue: 33000000, cashBalance: 1800000, connectionStatus: "AUTH_REQUIRED", pendingAuth: true, lastSyncedAt: new Date("2026-07-12T17:55:00+05:30") },
      { id: "brk_zer_kunal", tenantId: TENANT_ID, memberId: "mem_self", ownerName: "Kunal Desai", broker: "Zerodha", clientCode: "ZR-KD-8841", equityValue: 74000000, cashBalance: 4100000, connectionStatus: "CONNECTED", pendingAuth: false, lastSyncedAt: new Date("2026-07-13T09:39:00+05:30") },
      { id: "brk_ici_vijay", tenantId: TENANT_ID, memberId: "mem_father", ownerName: "Vijay Desai", broker: "ICICI Direct", clientCode: "IC-VJD-4207", equityValue: 58000000, cashBalance: 3400000, connectionStatus: "ERROR", pendingAuth: true, lastSyncedAt: new Date("2026-07-11T20:10:00+05:30") },
    ],
  });
  await prisma.dematAccount.createMany({
    skipDuplicates: true,
    data: [
      { id: "dmt_ang_vijay", tenantId: TENANT_ID, brokerAccountId: "brk_ang_vijay", dpId: "12033200", boId: "1203320000110045", depository: "CDSL" },
      { id: "dmt_ang_kunal", tenantId: TENANT_ID, brokerAccountId: "brk_ang_kunal", dpId: "12033200", boId: "1203320000110088", depository: "CDSL" },
      { id: "dmt_ang_neha", tenantId: TENANT_ID, brokerAccountId: "brk_ang_neha", dpId: "IN300476", boId: "IN30047600220091", depository: "NSDL" },
      { id: "dmt_ang_huf", tenantId: TENANT_ID, brokerAccountId: "brk_ang_huf", dpId: "12033200", boId: "1203320000110120", depository: "CDSL" },
      { id: "dmt_zer_kunal", tenantId: TENANT_ID, brokerAccountId: "brk_zer_kunal", dpId: "12081600", boId: "1208160000445511", depository: "CDSL" },
      { id: "dmt_ici_vijay", tenantId: TENANT_ID, brokerAccountId: "brk_ici_vijay", dpId: "IN300126", boId: "IN30012600334477", depository: "NSDL" },
    ],
  });

  // --- Mutual fund folios -------------------------------------------------
  await prisma.mutualFundFolio.createMany({
    skipDuplicates: true,
    data: [
      { id: "mf_sbi", tenantId: TENANT_ID, memberId: "mem_father", ownerName: "Vijay Desai", amc: "SBI Mutual Fund", scheme: "SBI Bluechip Fund", folioNo: "SMC/SBI/10241", category: "EQUITY", distributor: "SMC Global Securities", units: 640000, nav: 97.5, invested: 52000000, currentValue: 62400000, xirr: 15.8 },
      { id: "mf_hdfc", tenantId: TENANT_ID, memberId: "mem_father", ownerName: "Vijay Desai", amc: "HDFC Mutual Fund", scheme: "HDFC Flexi Cap Fund", folioNo: "SMC/HDFC/20558", category: "EQUITY", distributor: "SMC Global Securities", units: 285000, nav: 169.1, invested: 39000000, currentValue: 48200000, xirr: 17.2 },
      { id: "mf_ppfas", tenantId: TENANT_ID, memberId: "mem_self", ownerName: "Kunal Desai", amc: "PPFAS Mutual Fund", scheme: "Parag Parikh Flexi Cap Fund", folioNo: "SMC/PPF/30912", category: "EQUITY", distributor: "SMC Global Securities", units: 628000, nav: 82.17, invested: 42000000, currentValue: 51600000, xirr: 18.4 },
      { id: "mf_icici", tenantId: TENANT_ID, memberId: "mem_self", ownerName: "Kunal Desai", amc: "ICICI Prudential Mutual Fund", scheme: "ICICI Pru Liquid Fund", folioNo: "SMC/ICI/40873", category: "LIQUID", distributor: "SMC Global Securities", units: 195000, nav: 383.6, invested: 72000000, currentValue: 74800000, xirr: 6.7 },
      { id: "mf_axis", tenantId: TENANT_ID, memberId: "mem_spouse", ownerName: "Neha Desai", amc: "Axis Mutual Fund", scheme: "Axis ELSS Tax Saver Fund", folioNo: "SMC/AXS/50120", category: "ELSS", distributor: "SMC Global Securities", units: 260000, nav: 88.85, invested: 19000000, currentValue: 23100000, xirr: 12.1 },
      { id: "mf_nippon", tenantId: TENANT_ID, memberId: "mem_mother", ownerName: "Lata Desai", amc: "Nippon India Mutual Fund", scheme: "Nippon India Index Fund - Nifty 50", folioNo: "SMC/NIP/60334", category: "INDEX", distributor: "SMC Global Securities", units: 210000, nav: 148.6, invested: 26000000, currentValue: 31200000, xirr: 14.3 },
      { id: "mf_kotak", tenantId: TENANT_ID, memberId: "mem_huf", ownerName: "Desai Family HUF", amc: "Kotak Mahindra Mutual Fund", scheme: "Kotak Balanced Advantage Fund", folioNo: "SMC/KOT/70219", category: "HYBRID", distributor: "SMC Global Securities", units: 615000, nav: 43.7, invested: 23000000, currentValue: 26900000, xirr: 11.4 },
    ],
  });

  // --- Insurance policies -------------------------------------------------
  await prisma.insurancePolicy.createMany({
    skipDuplicates: true,
    data: [
      { id: "ins_hdfc_term", tenantId: TENANT_ID, memberId: "mem_father", insuredName: "Vijay Desai", insurer: "HDFC Life", policyNo: "T-889001", type: "TERM", sumAssured: 250000000, annualPremium: 520000, premiumDueDate: new Date("2026-07-22"), status: "ACTIVE", nominee: "Kunal Desai" },
      { id: "ins_max_term", tenantId: TENANT_ID, memberId: "mem_self", insuredName: "Kunal Desai", insurer: "Max Life", policyNo: "T-889002", type: "TERM", sumAssured: 150000000, annualPremium: 300000, premiumDueDate: new Date("2026-08-02"), status: "ACTIVE", nominee: "Neha Desai" },
      { id: "ins_icici_term", tenantId: TENANT_ID, memberId: "mem_spouse", insuredName: "Neha Desai", insurer: "ICICI Prudential", policyNo: "T-889003", type: "TERM", sumAssured: 60000000, annualPremium: 180000, premiumDueDate: new Date("2026-07-30"), status: "ACTIVE", nominee: "Kunal Desai" },
      { id: "ins_star_health", tenantId: TENANT_ID, memberId: "mem_father", insuredName: "Desai Family Floater", insurer: "Star Health", policyNo: "H-445120", type: "HEALTH", sumAssured: 5000000, annualPremium: 165000, premiumDueDate: new Date("2026-08-18"), status: "ACTIVE", nominee: "Vijay Desai" },
      { id: "ins_icici_ulip", tenantId: TENANT_ID, memberId: "mem_self", insuredName: "Kunal Desai", insurer: "ICICI Prudential", policyNo: "U-330551", type: "ULIP", sumAssured: 20000000, annualPremium: 900000, premiumDueDate: new Date("2026-09-05"), status: "ACTIVE", nominee: "Neha Desai" },
      { id: "ins_lic_endow", tenantId: TENANT_ID, memberId: "mem_mother", insuredName: "Lata Desai", insurer: "LIC of India", policyNo: "E-221009", type: "ENDOWMENT", sumAssured: 10000000, annualPremium: 220000, premiumDueDate: new Date("2026-07-16"), status: "GRACE", nominee: "Vijay Desai" },
      { id: "ins_motor_gle", tenantId: TENANT_ID, memberId: "mem_father", insuredName: "Vijay Desai", insurer: "Tata AIG", policyNo: "M-556677", type: "MOTOR", sumAssured: 9500000, annualPremium: 68000, premiumDueDate: new Date("2026-11-12"), status: "ACTIVE", nominee: "Vijay Desai" },
    ],
  });

  // --- Tally companies + ledger entries ----------------------------------
  await prisma.tallyCompany.createMany({
    skipDuplicates: true,
    data: [
      { id: "tly_pvt", tenantId: TENANT_ID, entityId: "ent_pvt", companyName: "V J Desai Ventures Pvt Ltd", gstin: "27AABCC1234D1Z5", financialYear: "2025-26", syncState: "SYNCED", ledgerCount: 428, closingBalance: 486200000, lastSyncedAt: new Date("2026-07-13T06:15:00+05:30") },
      { id: "tly_llp", tenantId: TENANT_ID, entityId: "ent_llp", companyName: "V J Desai Advisory LLP", gstin: "27AABFC9012L1ZP", financialYear: "2025-26", syncState: "PENDING", ledgerCount: 212, closingBalance: 128600000, lastSyncedAt: new Date("2026-07-12T21:40:00+05:30") },
      { id: "tly_huf", tenantId: TENANT_ID, entityId: "ent_huf", companyName: "Desai Family HUF", gstin: "27AAAHD7890N1ZR", financialYear: "2025-26", syncState: "ERROR", ledgerCount: 96, closingBalance: 74300000, lastSyncedAt: new Date("2026-07-11T18:05:00+05:30") },
    ],
  });
  await prisma.ledgerEntry.createMany({
    skipDuplicates: true,
    data: [
      { id: "led_1001", tenantId: TENANT_ID, tallyCompanyId: "tly_pvt", entityId: "ent_pvt", date: new Date("2026-06-30"), ledgerName: "Dividend Received", voucherType: "RECEIPT", voucherNo: "RV-1042", narration: "Dividend credit — listed equity", debit: 0, credit: 1250000, runningBalance: 486200000 },
      { id: "led_1002", tenantId: TENANT_ID, tallyCompanyId: "tly_pvt", entityId: "ent_pvt", date: new Date("2026-06-28"), ledgerName: "Professional Fees", voucherType: "PAYMENT", voucherNo: "PV-2210", narration: "Advisory retainer", debit: 340000, credit: 0, runningBalance: 484950000 },
      { id: "led_1003", tenantId: TENANT_ID, tallyCompanyId: "tly_pvt", entityId: "ent_pvt", date: new Date("2026-06-25"), ledgerName: "Consulting Revenue", voucherType: "SALES", voucherNo: "SV-8801", narration: "Invoice #8801", debit: 0, credit: 2800000, runningBalance: 485290000 },
      { id: "led_1004", tenantId: TENANT_ID, tallyCompanyId: "tly_llp", entityId: "ent_llp", date: new Date("2026-06-29"), ledgerName: "Advisory Income", voucherType: "SALES", voucherNo: "SV-5521", narration: "Quarterly advisory fee", debit: 0, credit: 1600000, runningBalance: 128600000 },
      { id: "led_1005", tenantId: TENANT_ID, tallyCompanyId: "tly_llp", entityId: "ent_llp", date: new Date("2026-06-27"), ledgerName: "Brokerage & Statutory Charges", voucherType: "PAYMENT", voucherNo: "PV-5310", narration: "Quarterly broker charges", debit: 18500, credit: 0, runningBalance: 127000000 },
      { id: "led_1006", tenantId: TENANT_ID, tallyCompanyId: "tly_huf", entityId: "ent_huf", date: new Date("2026-06-26"), ledgerName: "Interest Received", voucherType: "RECEIPT", voucherNo: "RV-3120", narration: "FD interest credit", debit: 0, credit: 420000, runningBalance: 74300000 },
    ],
  });

  // --- Documents ----------------------------------------------------------
  await prisma.document.createMany({
    skipDuplicates: true,
    data: [
      { id: "doc_ao_stmt", tenantId: TENANT_ID, name: "Angel One Holding Statement — Jun 2026", category: "STATEMENT", ownerName: "Vijay Desai", sizeKb: 842, status: "VERIFIED", uploadedAt: new Date("2026-07-02") },
      { id: "doc_smc_cas", tenantId: TENANT_ID, name: "SMC Consolidated Account Statement — Q1 FY26", category: "STATEMENT", ownerName: "Kunal Desai", sizeKb: 1204, status: "VERIFIED", uploadedAt: new Date("2026-07-05") },
      { id: "doc_ici_note", tenantId: TENANT_ID, name: "ICICI Direct Contract Note — 09 Jul 2026", category: "CONTRACT_NOTE", ownerName: "Vijay Desai", sizeKb: 96, status: "PENDING", uploadedAt: new Date("2026-07-09") },
      { id: "doc_moa", tenantId: TENANT_ID, name: "V J Desai Ventures — MOA & AOA", category: "LEGAL", ownerName: "V J Desai Ventures Pvt Ltd", sizeKb: 2140, status: "VERIFIED", uploadedAt: new Date("2026-05-30") },
      { id: "doc_pan_kunal", tenantId: TENANT_ID, name: "PAN Card — Kunal Desai", category: "KYC", ownerName: "Kunal Desai", sizeKb: 210, status: "VERIFIED", uploadedAt: new Date("2026-04-12") },
    ],
  });

  // --- Instruments + holding snapshots -----------------------------------
  await prisma.instrument.createMany({
    skipDuplicates: true,
    data: [
      { id: "inst_reliance", symbol: "RELIANCE", name: "Reliance Industries", type: "EQUITY", exchange: "NSE", sector: "Energy" },
      { id: "inst_hdfcbank", symbol: "HDFCBANK", name: "HDFC Bank", type: "EQUITY", exchange: "NSE", sector: "Financials" },
      { id: "inst_infy", symbol: "INFY", name: "Infosys", type: "EQUITY", exchange: "NSE", sector: "Information Technology" },
      { id: "inst_lt", symbol: "LT", name: "Larsen & Toubro", type: "EQUITY", exchange: "NSE", sector: "Industrials" },
      { id: "inst_tcs", symbol: "TCS", name: "Tata Consultancy Services", type: "EQUITY", exchange: "NSE", sector: "Information Technology" },
      { id: "inst_icicibank", symbol: "ICICIBANK", name: "ICICI Bank", type: "EQUITY", exchange: "NSE", sector: "Financials" },
    ],
  });
  await prisma.holdingSnapshot.createMany({
    skipDuplicates: true,
    data: [
      { id: "hld_reliance", tenantId: TENANT_ID, brokerAccountId: "brk_ang_vijay", instrumentId: "inst_reliance", quantity: 34000, avgPrice: 2450, ltp: 2980, value: 101320000, dayChangePct: 0.82, asOf: new Date("2026-07-13T15:30:00+05:30") },
      { id: "hld_hdfcbank", tenantId: TENANT_ID, brokerAccountId: "brk_ang_vijay", instrumentId: "inst_hdfcbank", quantity: 42000, avgPrice: 1520, ltp: 1685, value: 70770000, dayChangePct: 0.34, asOf: new Date("2026-07-13T15:30:00+05:30") },
      { id: "hld_infy", tenantId: TENANT_ID, brokerAccountId: "brk_ang_kunal", instrumentId: "inst_infy", quantity: 36000, avgPrice: 1310, ltp: 1560, value: 56160000, dayChangePct: -0.45, asOf: new Date("2026-07-13T15:30:00+05:30") },
      { id: "hld_lt", tenantId: TENANT_ID, brokerAccountId: "brk_zer_kunal", instrumentId: "inst_lt", quantity: 13500, avgPrice: 2200, ltp: 3560, value: 48060000, dayChangePct: 1.24, asOf: new Date("2026-07-13T15:30:00+05:30") },
      { id: "hld_tcs", tenantId: TENANT_ID, brokerAccountId: "brk_ici_vijay", instrumentId: "inst_tcs", quantity: 11000, avgPrice: 3300, ltp: 3890, value: 42790000, dayChangePct: 0.12, asOf: new Date("2026-07-13T15:30:00+05:30") },
      { id: "hld_icicibank", tenantId: TENANT_ID, brokerAccountId: "brk_ang_neha", instrumentId: "inst_icicibank", quantity: 30000, avgPrice: 890, ltp: 1180, value: 35400000, dayChangePct: 0.98, asOf: new Date("2026-07-13T15:30:00+05:30") },
    ],
  });

  // --- Feature flags (tenant overrides) ----------------------------------
  await prisma.featureFlag.createMany({
    skipDuplicates: true,
    data: [
      { id: "ff_broker", tenantId: TENANT_ID, key: "brokerHub", label: "Broker Hub", enabled: true, scope: "TENANT" },
      { id: "ff_mf", tenantId: TENANT_ID, key: "mutualFunds", label: "Mutual Funds", enabled: true, scope: "TENANT" },
      { id: "ff_tally", tenantId: TENANT_ID, key: "tallySync", label: "Tally Sync", enabled: true, scope: "TENANT" },
      { id: "ff_recon", tenantId: TENANT_ID, key: "reconciliation", label: "Reconciliation Centre", enabled: true, scope: "TENANT" },
      { id: "ff_trading", tenantId: TENANT_ID, key: "controlledTrading", label: "Controlled Trading", enabled: false, scope: "TENANT" },
      { id: "ff_billing", tenantId: TENANT_ID, key: "billing", label: "Billing", enabled: false, scope: "TENANT" },
    ],
  });

  // --- Reconciliation run + exceptions -----------------------------------
  await prisma.reconciliationRun.upsert({
    where: { id: "recon_1001" },
    update: {},
    create: { id: "recon_1001", tenantId: TENANT_ID, source: "Nightly consolidated reconciliation", status: "COMPLETED", startedAt: new Date("2026-07-13T02:00:00+05:30"), completedAt: new Date("2026-07-13T02:12:00+05:30"), exceptionCount: 7 },
  });
  await prisma.reconciliationException.createMany({
    skipDuplicates: true,
    data: [
      { id: "exc_1001", tenantId: TENANT_ID, runId: "recon_1001", source: "ICICI Direct · Vijay Desai", description: "Contract note value mismatch vs demat holding", severity: "HIGH", amount: 245000, status: "OPEN", raisedAt: new Date("2026-07-12") },
      { id: "exc_1002", tenantId: TENANT_ID, runId: "recon_1001", source: "Angel One · Desai Family HUF", description: "Re-authentication required to resume sync", severity: "HIGH", amount: 0, status: "OPEN", raisedAt: new Date("2026-07-13") },
      { id: "exc_1003", tenantId: TENANT_ID, runId: "recon_1001", source: "Tally · V J Desai Ventures", description: "Dividend credit missing in books of account", severity: "MEDIUM", amount: 84000, status: "OPEN", raisedAt: new Date("2026-07-10") },
      { id: "exc_1004", tenantId: TENANT_ID, runId: "recon_1001", source: "SMC Global · MF Folios", description: "SIP instalment not reflected in the folio statement", severity: "LOW", amount: 50000, status: "IN_REVIEW", raisedAt: new Date("2026-07-09") },
    ],
  });

  // --- Approvals ----------------------------------------------------------
  await prisma.approval.createMany({
    skipDuplicates: true,
    data: [
      { id: "apr_1001", tenantId: TENANT_ID, type: "REAUTHENTICATION", request: "Re-authenticate Angel One (Desai Family HUF)", entity: "Desai Family HUF", requestedBy: "Kunal Desai", stage: "PENDING", raisedAt: new Date("2026-07-13") },
      { id: "apr_1002", tenantId: TENANT_ID, type: "DATA_CORRECTION", request: "Book missing dividend credit in Tally", entity: "V J Desai Ventures Pvt Ltd", requestedBy: "Family Accountant", makerId: "usr_accts", stage: "AWAITING_CHECKER", raisedAt: new Date("2026-07-11") },
      { id: "apr_1003", tenantId: TENANT_ID, type: "USER_INVITE", request: "Invite Lata Desai as Viewer", entity: "V J Desai Family", requestedBy: "Kunal Desai", stage: "APPROVED", raisedAt: new Date("2026-07-08"), decidedAt: new Date("2026-07-09"), checkerId: "usr_vijay" },
    ],
  });

  // --- Audit logs ---------------------------------------------------------
  await prisma.auditLog.createMany({
    skipDuplicates: true,
    data: [
      { id: "aud_1001", tenantId: TENANT_ID, actor: "kunal@vjdesai.com", action: "SYNC_TRIGGERED", entity: "BrokerAccount · Angel One", detail: "Manual sync triggered for all broker accounts", ipAddress: "203.0.113.10", timestamp: new Date("2026-07-13T09:40:00+05:30") },
      { id: "aud_1002", tenantId: TENANT_ID, actor: "accounts@vjdesai.com", action: "DOCUMENT_UPLOADED", entity: "Document · SMC CAS Q1 FY26", detail: "Uploaded consolidated account statement", ipAddress: "203.0.113.11", timestamp: new Date("2026-07-05T11:20:00+05:30") },
      { id: "aud_1003", tenantId: TENANT_ID, actor: "vijay@vjdesai.com", action: "APPROVAL_DECIDED", entity: "Approval · User invite", detail: "Approved viewer invite for Lata Desai", ipAddress: "203.0.113.12", timestamp: new Date("2026-07-09T18:05:00+05:30") },
    ],
  });

  console.log("Seed complete for V J Desai Family.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
