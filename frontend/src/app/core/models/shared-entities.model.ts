export interface NotificationItem {
  id: number;
  userId: number;
  title: string;
  content: string;
  type: 'APPLICATION_STATUS' | 'SYSTEM' | 'DEADLINE_REMINDER' | 'ACTION_REQUIRED';
  read: boolean;
  referenceId?: number; // applicationId or other entity id
  referenceType?: string;
  createdAt: string;
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  orderNum: number;
  active: boolean;
  createdAt?: string;
}

export interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  processingApplications: number;
  needRevisionApplications: number;
  completedApplications: number;
  rejectedApplications: number;
  todayApplications: number;
  totalUsers?: number;
  totalProcedures?: number;
  categoryDistribution?: { categoryName: string; count: number }[];
  statusDistribution?: { status: string; label: string; count: number; color: string }[];
  monthlyTrend?: { month: string; total: number; completed: number }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: string;
  suggestions?: string[];
  isStreaming?: boolean;
}
