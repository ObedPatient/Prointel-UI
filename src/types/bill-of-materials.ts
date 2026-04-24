export type BillOfMaterialsStatus = "Draft" | "Approved" | "Superseded";

export interface BillOfMaterialLine {
  id: string;
  tenant_id: string;
  bill_of_materials_id: string;
  line_number: number;
  raw_material_id: string;
  quantity_per_unit: number;
  unit_of_measure: string;
  expected_wastage_percentage: number;
  is_optional: boolean;
  notes: string;
  created_at: string;
}

export interface BillOfMaterials {
  id: string;
  tenant_id: string;
  bom_code: string;
  product_category_id: string;
  version: number;
  name: string;
  description: string;
  status: BillOfMaterialsStatus;
  created_by: string;
  approved_by: string | null;
  approved_at: string | null;
  superseded_at: string | null;
  created_at: string;
  lines: BillOfMaterialLine[];
}

export interface RawMaterialOption {
  id: string;
  name: string;
  default_unit_of_measure: string;
}
