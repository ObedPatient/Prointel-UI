export type InspectionCheckKey =
  | "dimensions"
  | "print_colour"
  | "fold_stitch"
  | "glue"
  | "appearance";

export type InspectionCheckStatus = "Pass" | "Fail";

export type InspectionType = "Incoming" | "Production";

export type QualityControlTab = "Inspections" | "Awaiting QC" | "Analytics";

export interface QualityInspectionChecks {
  dimensions: InspectionCheckStatus;
  print_colour: InspectionCheckStatus;
  fold_stitch: InspectionCheckStatus;
  glue: InspectionCheckStatus;
  appearance: InspectionCheckStatus;
}

export interface QualityInspection extends QualityInspectionChecks {
  id: string;
  customer_id: string;
  job_number: string;
  product_category_id: string;
  board_spec: string;
  inspector: string;
  inspected_at: string;
  remarks: string;
  type: InspectionType;
  created_at: string;
}

export interface CreateQualityInspectionData extends QualityInspectionChecks {
  customer_id: string;
  job_number: string;
  product_category_id: string;
  board_spec: string;
  inspector: string;
  inspected_at: string;
  remarks: string;
  type: InspectionType;
}

export interface QualityCheckpointDefinition {
  key: InspectionCheckKey;
  label: string;
  shortLabel: string;
  num: number;
}

export interface InspectionMachineLog {
  stage: string;
  date: string;
  produced: number;
  setting: number;
  defects: number;
  note: string;
}

export interface InspectionOutputSummary {
  produced: number;
  defective: number;
  netGood: number;
  defectPct: number;
  qcPass: boolean;
}

export interface QualityOutputRow extends InspectionOutputSummary {
  job: string;
  client: string;
}

export type AwaitingQualityPriority = "High" | "Medium" | "Normal";

export interface AwaitingQualityJob {
  id: string;
  production_card_id: string;
  job_number: string;
  customer_id: string;
  product_category_id: string;
  queued_at: string;
  target_quantity: number;
  actual_output_quantity: number;
  pending_checks: number;
  priority: AwaitingQualityPriority;
  notes: string;
}
