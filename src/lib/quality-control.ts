import type {
  AwaitingQualityJob,
  CreateQualityInspectionData,
  InspectionCheckKey,
  InspectionMachineLog,
  InspectionOutputSummary,
  QualityCheckpointDefinition,
  QualityControlTab,
  QualityInspection,
  QualityOutputRow,
} from "@/types/quality-control";

const STORAGE_KEY = "prointel.quality-inspections";

export const QUALITY_CONTROL_TABS: QualityControlTab[] = [
  "Inspections",
  "Awaiting QC",
  "Analytics",
];

export const QUALITY_CHECKPOINTS: QualityCheckpointDefinition[] = [
  {
    key: "dimensions",
    label: "Box Dimensions Match Order",
    shortLabel: "Dimensions",
    num: 1,
  },
  {
    key: "print_colour",
    label: "Printing Colour & Alignment",
    shortLabel: "Print/Colour",
    num: 2,
  },
  {
    key: "fold_stitch",
    label: "Folding & Stitching Quality",
    shortLabel: "Fold/Stitch",
    num: 3,
  },
  {
    key: "glue",
    label: "Glue Application Consistent",
    shortLabel: "Glue",
    num: 4,
  },
  {
    key: "appearance",
    label: "Final Appearance Approved",
    shortLabel: "Appearance",
    num: 5,
  },
];

export const QUALITY_CHECK_KEYS: InspectionCheckKey[] = QUALITY_CHECKPOINTS.map(
  (checkpoint) => checkpoint.key,
);

const INITIAL_QUALITY_INSPECTIONS: QualityInspection[] = [
  {
    id: "quality-inspection-001",
    customer_id: "INYANGE Industries",
    job_number: "PC-2026-0041",
    product_category_id: "Milk Carton 1L Outer",
    board_spec: "RSC 3ply Brown 600x400x350mm",
    inspector: "Aimee Ingabire",
    inspected_at: "2026-02-05",
    type: "Production",
    dimensions: "Pass",
    print_colour: "Pass",
    fold_stitch: "Pass",
    glue: "Pass",
    appearance: "Pass",
    remarks: "All checks passed. Product meets spec.",
    created_at: "2026-02-05T08:45:00.000Z",
  },
  {
    id: "quality-inspection-002",
    customer_id: "Skol Brewery Rwanda",
    job_number: "PC-2026-0043",
    product_category_id: "Skol Lager Tray",
    board_spec: "Die Cut 3ply White 380x256x120mm",
    inspector: "Aimee Ingabire",
    inspected_at: "2026-02-12",
    type: "Production",
    dimensions: "Pass",
    print_colour: "Pass",
    fold_stitch: "Fail",
    glue: "Pass",
    appearance: "Fail",
    remarks: "Tray corners not folding cleanly on about 3% of units. Die needs resharpening.",
    created_at: "2026-02-12T14:10:00.000Z",
  },
];

const MACHINE_LOGS_BY_JOB: Record<string, InspectionMachineLog[]> = {
  "PC-2026-0041": [
    {
      stage: "Printing & Die-Cut",
      date: "2026-02-03",
      produced: 2440,
      setting: 38,
      defects: 28,
      note: "Completed run with minor tensions.",
    },
    {
      stage: "Gluing & Stitching",
      date: "2026-02-04",
      produced: 5120,
      setting: 0,
      defects: 0,
      note: "Gluing completed, all units passed.",
    },
  ],
  "PC-2026-0043": [
    {
      stage: "Printing & Die-Cut",
      date: "2026-02-07",
      produced: 2610,
      setting: 42,
      defects: 22,
      note: "Colour calibration adjusted after first 100 sheets.",
    },
    {
      stage: "Folding & Stitching",
      date: "2026-02-08",
      produced: 2480,
      setting: 17,
      defects: 44,
      note: "Corner folding instability observed during the last quarter of the run.",
    },
  ],
};

const OUTPUT_SUMMARY_BY_JOB: Record<string, Omit<InspectionOutputSummary, "qcPass">> = {
  "PC-2026-0041": {
    produced: 5120,
    defective: 145,
    netGood: 4975,
    defectPct: 2.8,
  },
  "PC-2026-0042": {
    produced: 4800,
    defective: 96,
    netGood: 4704,
    defectPct: 2.0,
  },
  "PC-2026-0043": {
    produced: 12350,
    defective: 380,
    netGood: 11970,
    defectPct: 3.1,
  },
};

const INITIAL_AWAITING_QUALITY_JOBS: AwaitingQualityJob[] = [
  {
    id: "awaiting-qc-001",
    production_card_id: "production-card-003",
    job_number: "PC-2026-0043",
    customer_id: "Skol Brewery Rwanda",
    product_category_id: "Skol Lager Tray",
    queued_at: "2026-02-12",
    target_quantity: 12000,
    actual_output_quantity: 11978,
    pending_checks: 2,
    priority: "High",
    notes: "Folding and appearance require sign-off before release.",
  },
  {
    id: "awaiting-qc-002",
    production_card_id: "production-card-006",
    job_number: "PC-2026-0046",
    customer_id: "Bralirwa Plc",
    product_category_id: "Soft Drink Shrink Wrap",
    queued_at: "2026-02-13",
    target_quantity: 6800,
    actual_output_quantity: 6615,
    pending_checks: 3,
    priority: "Medium",
    notes: "Hold for print alignment review on export line B.",
  },
  {
    id: "awaiting-qc-003",
    production_card_id: "production-card-007",
    job_number: "PC-2026-0047",
    customer_id: "Azam Foods",
    product_category_id: "Detergent Box",
    queued_at: "2026-02-14",
    target_quantity: 4500,
    actual_output_quantity: 4410,
    pending_checks: 1,
    priority: "Normal",
    notes: "Waiting on final glue bond verification.",
  },
  {
    id: "awaiting-qc-004",
    production_card_id: "production-card-008",
    job_number: "PC-2026-0048",
    customer_id: "Rwanda Mountain Tea",
    product_category_id: "Tea Box 250g Export",
    queued_at: "2026-02-14",
    target_quantity: 8200,
    actual_output_quantity: 8092,
    pending_checks: 2,
    priority: "High",
    notes: "Export packaging requires documented colour approval.",
  },
  {
    id: "awaiting-qc-005",
    production_card_id: "production-card-009",
    job_number: "PC-2026-0049",
    customer_id: "Sulfo Rwanda Industries",
    product_category_id: "Export Carton",
    queued_at: "2026-02-15",
    target_quantity: 3000,
    actual_output_quantity: 2875,
    pending_checks: 4,
    priority: "Medium",
    notes: "Minor crushing observed on pallet edge samples.",
  },
  {
    id: "awaiting-qc-006",
    production_card_id: "production-card-010",
    job_number: "PC-2026-0050",
    customer_id: "INYANGE Industries",
    product_category_id: "Milk Carton 500ml Outer",
    queued_at: "2026-02-15",
    target_quantity: 5400,
    actual_output_quantity: 5308,
    pending_checks: 1,
    priority: "Normal",
    notes: "Queued for final dimensional confirmation.",
  },
  {
    id: "awaiting-qc-007",
    production_card_id: "production-card-011",
    job_number: "PC-2026-0051",
    customer_id: "Bralirwa Plc",
    product_category_id: "Beer Crate Divider",
    queued_at: "2026-02-16",
    target_quantity: 9100,
    actual_output_quantity: 8930,
    pending_checks: 2,
    priority: "High",
    notes: "Rush order awaiting supervisor release before dispatch.",
  },
];

function sortQualityInspections(inspections: QualityInspection[]): QualityInspection[] {
  return [...inspections].sort((left, right) => right.created_at.localeCompare(left.created_at));
}

function normalizeQualityInspection(
  inspection: QualityInspection | Record<string, unknown>,
): QualityInspection {
  const source = inspection as Record<string, unknown>;

  return {
    id: typeof source.id === "string" ? source.id : `quality-inspection-${Date.now()}`,
    customer_id: typeof source.customer_id === "string" ? source.customer_id : "",
    job_number: typeof source.job_number === "string" ? source.job_number : "",
    product_category_id:
      typeof source.product_category_id === "string" ? source.product_category_id : "",
    board_spec: typeof source.board_spec === "string" ? source.board_spec : "",
    inspector: typeof source.inspector === "string" ? source.inspector : "",
    inspected_at: typeof source.inspected_at === "string" ? source.inspected_at : "",
    remarks: typeof source.remarks === "string" ? source.remarks : "",
    type: source.type === "Incoming" ? "Incoming" : "Production",
    created_at: typeof source.created_at === "string" ? source.created_at : new Date().toISOString(),
    dimensions: source.dimensions === "Fail" ? "Fail" : "Pass",
    print_colour: source.print_colour === "Fail" ? "Fail" : "Pass",
    fold_stitch: source.fold_stitch === "Fail" ? "Fail" : "Pass",
    glue: source.glue === "Fail" ? "Fail" : "Pass",
    appearance: source.appearance === "Fail" ? "Fail" : "Pass",
  };
}

export function loadQualityInspections(): QualityInspection[] {
  if (typeof window === "undefined") {
    return sortQualityInspections(INITIAL_QUALITY_INSPECTIONS);
  }

  let saved: string | null = null;

  try {
    saved = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return sortQualityInspections(INITIAL_QUALITY_INSPECTIONS);
  }

  if (!saved) {
    return sortQualityInspections(INITIAL_QUALITY_INSPECTIONS);
  }

  try {
    const parsed = JSON.parse(saved) as Array<QualityInspection | Record<string, unknown>>;
    return parsed.length
      ? sortQualityInspections(parsed.map(normalizeQualityInspection))
      : sortQualityInspections(INITIAL_QUALITY_INSPECTIONS);
  } catch {
    return sortQualityInspections(INITIAL_QUALITY_INSPECTIONS);
  }
}

export function saveQualityInspections(inspections: QualityInspection[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(sortQualityInspections(inspections)),
    );
  } catch {
    // Ignore storage failures so the page remains usable in restricted browsers.
  }
}

export function createQualityInspectionRecord(
  data: CreateQualityInspectionData,
): QualityInspection {
  const now = new Date().toISOString();

  return {
    ...data,
    id: `quality-inspection-${Date.now()}`,
    created_at: now,
  };
}

export function allChecksPassed(inspection: QualityInspection): boolean {
  return QUALITY_CHECK_KEYS.every((key) => inspection[key] === "Pass");
}

export function hasCheckFailure(inspection: QualityInspection): boolean {
  return QUALITY_CHECK_KEYS.some((key) => inspection[key] === "Fail");
}

export function countPassedChecks(inspection: QualityInspection): number {
  return QUALITY_CHECK_KEYS.filter((key) => inspection[key] === "Pass").length;
}

export function countFailedChecks(inspection: QualityInspection): number {
  return QUALITY_CHECK_KEYS.filter((key) => inspection[key] === "Fail").length;
}

export function getInspectionMachineLogs(jobNumber: string): InspectionMachineLog[] {
  return MACHINE_LOGS_BY_JOB[jobNumber] ?? [
    {
      stage: "Quality Review",
      date: new Date().toLocaleDateString("en-CA"),
      produced: 0,
      setting: 0,
      defects: 0,
      note: "No machine log data recorded for this inspection yet.",
    },
  ];
}

export function getInspectionOutputSummary(
  inspection: QualityInspection,
): InspectionOutputSummary {
  const base = OUTPUT_SUMMARY_BY_JOB[inspection.job_number] ?? {
    produced: 5000,
    defective: countFailedChecks(inspection) * 35,
    netGood: 5000 - countFailedChecks(inspection) * 35,
    defectPct: Number(((countFailedChecks(inspection) / QUALITY_CHECK_KEYS.length) * 4).toFixed(1)),
  };

  return {
    ...base,
    qcPass: allChecksPassed(inspection),
  };
}

export function buildQualityOutputRows(inspections: QualityInspection[]): QualityOutputRow[] {
  return inspections.map((inspection) => {
    const summary = getInspectionOutputSummary(inspection);

    return {
      job: inspection.job_number,
      client: inspection.customer_id,
      ...summary,
    };
  });
}

export function loadAwaitingQualityJobs(): AwaitingQualityJob[] {
  return [...INITIAL_AWAITING_QUALITY_JOBS].sort((left, right) =>
    right.queued_at.localeCompare(left.queued_at),
  );
}
