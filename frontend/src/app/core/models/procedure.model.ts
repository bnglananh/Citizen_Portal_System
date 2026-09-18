export interface ProcedureCategory {
  id: number;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  active?: boolean;
}

export interface RequiredDocument {
  id: number;
  procedureId?: number;
  documentName: string;
  isRequired?: boolean;
  required?: boolean;
  note?: string;
  description?: string;
  allowedExtensions?: string[];
  templateFilePath?: string;
}

export interface Procedure {
  id: number;
  categoryId?: number;
  categoryName?: string;
  category?: ProcedureCategory;
  code: string;
  name: string;
  description?: string;
  processingTimeDays?: number;
  processingDurationDays?: number;
  feeAmount?: number;
  fee?: number;
  requiredDocuments: RequiredDocument[];
  stepsDescription?: string;
  submissionMethod?: string;
  implementationSteps?: string;
  conditions?: string;
  legalBasis?: string;
  active: boolean;
  createdAt?: string;
}
