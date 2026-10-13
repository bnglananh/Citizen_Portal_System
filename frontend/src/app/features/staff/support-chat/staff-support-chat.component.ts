import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ChangeDetectorRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SupportConversation, SupportMessage } from '../../../core/models/support.model';
import { SupportService } from '../../../core/services/support.service';

@Component({
  selector: 'app-staff-support-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzTagModule,
    NzBadgeModule,
    NzPopconfirmModule
  ],
  templateUrl: './staff-support-chat.component.html',
  styleUrls: ['./staff-support-chat.component.scss']
})
export class StaffSupportChatComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer?: ElementRef;
  @ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;

  private supportService = inject(SupportService);
  private message = inject(NzMessageService);
  private cdr = inject(ChangeDetectorRef);

  conversations: SupportConversation[] = [];
  filteredConversations: SupportConversation[] = [];
  selectedConversation: SupportConversation | null = null;
  messages: SupportMessage[] = [];

  searchQuery = '';
  inputMessage = '';
  isLoadingConversations = false;
  isLoadingMessages = false;
  isSending = false;

  selectedFile: File | null = null;
  selectedFilePreview: string | null = null;

  private pollingInterval: any = null;

  ngOnInit(): void {
    this.loadAssignedConversations();
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  loadAssignedConversations(isSilent: boolean = false): void {
    if (!isSilent) {
      this.isLoadingConversations = true;
    }

    this.supportService.getStaffAssignedConversations().subscribe({
      next: (convs) => {
        this.conversations = convs;
        this.filterConversations();
        this.isLoadingConversations = false;

        // Nếu chưa chọn cuộc trò chuyện nào và có danh sách -> chọn cuộc trò chuyện đầu tiên
        if (!this.selectedConversation && convs.length > 0) {
          this.selectConversation(convs[0]);
        } else if (this.selectedConversation) {
          // Cập nhật lại trạng thái selectedConversation từ danh sách mới
          const updated = convs.find(c => c.id === this.selectedConversation?.id);
          if (updated) {
            this.selectedConversation = updated;
          }
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingConversations = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterConversations(): void {
    const q = this.searchQuery.trim().toLowerCase();
    this.filteredConversations = this.conversations.filter(c =>
      !q ||
      (c.citizenName && c.citizenName.toLowerCase().includes(q)) ||
      (c.citizenPhone && c.citizenPhone.includes(q)) ||
      (c.subject && c.subject.toLowerCase().includes(q))
    );
  }

  selectConversation(conv: SupportConversation): void {
    this.selectedConversation = conv;
    this.isLoadingMessages = true;
    this.removeSelectedFile();
    this.loadMessages(conv.id);
  }

  loadMessages(convId: number, isSilent: boolean = false): void {
    this.supportService.getStaffMessages(convId).subscribe({
      next: (msgs) => {
        const hasNew = msgs.length !== this.messages.length;
        this.messages = msgs;
        this.isLoadingMessages = false;
        this.cdr.detectChanges();
        if (hasNew || !isSilent) {
          this.scrollToBottom();
        }
      },
      error: () => {
        this.isLoadingMessages = false;
        this.cdr.detectChanges();
      }
    });
  }

  startPolling(): void {
    this.stopPolling();
    this.pollingInterval = setInterval(() => {
      this.loadAssignedConversations(true);
      if (this.selectedConversation) {
        this.loadMessages(this.selectedConversation.id, true);
      }
    }, 3500);
  }

  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      this.message.warning('Tệp đính kèm không được vượt quá 10MB');
      return;
    }

    this.selectedFile = file;
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedFilePreview = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    } else {
      this.selectedFilePreview = null;
    }
    this.cdr.detectChanges();
  }

  removeSelectedFile(): void {
    this.selectedFile = null;
    this.selectedFilePreview = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    this.cdr.detectChanges();
  }

  sendMessage(): void {
    if (!this.selectedConversation) return;
    const text = this.inputMessage.trim();
    if (!text && !this.selectedFile) return;

    this.isSending = true;
    const fileToSend = this.selectedFile;

    this.supportService.sendStaffMessage(this.selectedConversation.id, text, fileToSend).subscribe({
      next: (sentMsg) => {
        this.messages.push(sentMsg);
        this.inputMessage = '';
        this.removeSelectedFile();
        this.isSending = false;
        this.scrollToBottom();
        this.loadAssignedConversations(true);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSending = false;
        this.message.error(err?.error?.message || 'Gửi phản hồi thất bại.');
        this.cdr.detectChanges();
      }
    });
  }

  resolveConversation(): void {
    if (!this.selectedConversation) return;
    this.supportService.resolveStaffConversation(this.selectedConversation.id).subscribe({
      next: () => {
        this.message.success('Đã đánh dấu hoàn tất phiên hỗ trợ!');
        if (this.selectedConversation) {
          this.selectedConversation.status = 'RESOLVED';
        }
        this.loadAssignedConversations();
        this.cdr.detectChanges();
      },
      error: () => {
        this.message.error('Thao tác thất bại.');
      }
    });
  }

  isImage(type?: string | null, url?: string | null): boolean {
    if (type && type.startsWith('image/')) return true;
    if (url) {
      const lower = url.toLowerCase();
      return lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.webp');
    }
    return false;
  }

  getDownloadUrl(filePath?: string | null): string {
    if (!filePath) return '#';
    return `/api/applications/download?filePath=${encodeURIComponent(filePath)}`;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }
}
