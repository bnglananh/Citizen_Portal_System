export type SupportStatus = 'OPEN' | 'RESOLVED' | 'CLOSED';

export interface SupportMessage {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderRole: 'ROLE_CITIZEN' | 'ROLE_STAFF' | 'ROLE_ADMIN' | string;
  content: string;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  attachmentType?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface SupportConversation {
  id: number;
  citizenId: number;
  citizenName: string;
  citizenPhone?: string;
  citizenEmail?: string;
  staffId: number;
  staffName: string;
  staffEmail?: string;
  subject: string;
  status: SupportStatus;
  createdAt: string;
  updatedAt: string;
  lastMessage?: SupportMessage | null;
  unreadCount: number;
}
