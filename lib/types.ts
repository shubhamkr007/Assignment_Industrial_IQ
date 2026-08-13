export type LeadStatus =
  | "new"
  | "contacted"
  | "test_drive"
  | "negotiation"
  | "order_placed"
  | "delivered"
  | "lost";

export type RepRole = "branch_manager" | "sales_officer";

export interface Branch {
  id: string;
  name: string;
  city: string;
}

export interface SalesRep {
  id: string;
  name: string;
  branch_id: string;
  role: RepRole;
  joined: string;
}

export interface StatusEvent {
  status: LeadStatus;
  timestamp: string;
  note: string;
}

export interface Lead {
  id: string;
  customer_name: string;
  phone: string;
  source: string;
  model_interested: string;
  status: LeadStatus;
  assigned_to: string;
  branch_id: string;
  created_at: string;
  last_activity_at: string;
  status_history: StatusEvent[];
  expected_close_date: string;
  deal_value: number;
  lost_reason: string | null;
}

export interface Target {
  branch_id: string;
  month: string;
  target_units: number;
  target_revenue: number;
}

export interface Delivery {
  lead_id: string;
  order_date: string;
  delivery_date: string;
  days_to_deliver: number;
  delay_reason: string | null;
}

export interface DatasetMetadata {
  generated_at: string;
  description: string;
  date_range: string;
  notes: string;
}

export interface Dataset {
  metadata: DatasetMetadata;
  branches: Branch[];
  sales_reps: SalesRep[];
  leads: Lead[];
  targets: Target[];
  deliveries: Delivery[];
}

export const FUNNEL_STAGES: Exclude<LeadStatus, "lost">[] = [
  "new",
  "contacted",
  "test_drive",
  "negotiation",
  "order_placed",
  "delivered",
];

export const OPEN_PRE_ORDER_STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "test_drive",
  "negotiation",
];

export const CLOSED_STATUSES: LeadStatus[] = ["delivered", "lost"];

/** Frozen "today" for the extract. Last activity lands in December 2025. */
export const AS_OF = new Date("2025-12-31T23:59:59.000Z");
export const AS_OF_LABEL = "31 Dec 2025";

export interface DateRange {
  from: Date;
  to: Date;
  key: string;
  label: string;
}

export interface Filters {
  range: DateRange;
  branchId: string | null;
  source: string | null;
  model: string | null;
  view: "ceo" | string;
}
