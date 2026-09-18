/**
 * 8 Trạng thái chuẩn theo State Machine quy định
 */
export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'RECEIVED'
  | 'PROCESSING'
  | 'NEED_REVISION'
  | 'RESUBMITTED'
  | 'REJECTED'
  | 'COMPLETED';

export interface ApplicationDocument {
  id?: number;
  documentName: string;
  originalFileName?: string;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  contentType?: string;
  fileType?: string;
  requiredDocumentId?: number;
  createdAt?: string;
}

export interface ApplicationHistory {
  id: number;
  applicationId?: number;
  fromStatus?: ApplicationStatus;
  toStatus: ApplicationStatus;
  comment?: string;
  notes?: string;
  actionBy?: string;
  performerName?: string;
  action?: string;
  createdAt: string;
}

export interface Application {
  id: number;
  applicationCode: string; // HS2026xxxx
  procedureId: number;
  procedureName: string;
  procedureCode?: string;
  procedure?: any;
  categoryName?: string;
  citizenId?: number;
  citizenName?: string;
  citizen?: any;
  citizenPhone?: string;
  citizenIdCard?: string;
  applicantName?: string;
  applicantPhone?: string;
  applicantEmail?: string;
  applicantIdCard?: string;
  applicantAddress?: string;
  status: ApplicationStatus;
  statusDisplayName?: string;
  note?: string;
  rejectionReason?: string;
  revisionNotes?: string;
  feeAmount?: number;
  resultSummary?: string;
  resultFilePath?: string;
  documents?: ApplicationDocument[];
  history?: ApplicationHistory[];
  historyList?: ApplicationHistory[];
  submittedAt?: string;
  expectedCompletionDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
}
