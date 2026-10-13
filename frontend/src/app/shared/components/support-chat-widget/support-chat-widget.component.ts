import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ChangeDetectorRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../../../core/auth/auth.service';
import { SupportConversation, SupportMessage } from '../../../core/models/support.model';
import { SupportService } from '../../../core/services/support.service';

@Component({
  selector: 'app-support-chat-widget',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzIconModule,
    NzButtonModule,
    NzInputModule,
    NzTagModule,
    NzTooltipModule
  ],
  templateUrl: './support-chat-widget.component.html',
  styleUrls: ['./support-chat-widget.component.scss']
})
export class SupportChatWidgetComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer?: ElementRef;
  @ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;

  private supportService = inject(SupportService);
  authService = inject(AuthService);
  private message = inject(NzMessageService);
  private cdr = inject(ChangeDetectorRef);

  isOpen = false;
  isLoading = false;
  isSending = false;

  conversation: SupportConversation | null = null;
  messages: SupportMessage[] = [];
  inputMessage = '';
  connectionError: string | null = null;

  selectedFile: File | null = null;
  selectedFilePreview: string | null = null;

  private pollingInterval: any = null;

  ngOnInit(): void {
    // Nếu user đã đăng nhập, có thể sẵn sàng kết nối
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  toggleChat(): void {
    if (!this.authService.isAuthenticated()) {
      this.message.warning('Vui lòng đăng nhập tài khoản để kết nối với cán bộ trực ban!');
      return;
    }

    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.loadOrCreateConversation();
      this.startPolling();
    } else {
      this.stopPolling();
    }
  }

  loadOrCreateConversation(): void {
    this.isLoading = true;
    this.connectionError = null;
    this.cdr.detectChanges();

    this.supportService.getCurrentCitizenConversation().subscribe({
      next: (conv) => {
        this.conversation = conv;
        this.isLoading = false;
        this.connectionError = null;
        this.loadMessages(conv.id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.connectionError = err?.error?.message || 'Không thể kết nối đến máy chủ hỗ trợ lúc này. Vui lòng kiểm tra đăng nhập hoặc thử lại.';
        this.message.error('Không thể kết nối đến máy chủ hỗ trợ.');
        this.cdr.detectChanges();
      }
    });
  }

  loadMessages(convId: number, isSilent: boolean = false): void {
    this.supportService.getCitizenMessages(convId).subscribe({
      next: (msgs) => {
        const hasNew = msgs.length !== this.messages.length;
        this.messages = msgs;
        this.cdr.detectChanges();
        if (hasNew || !isSilent) {
          this.scrollToBottom();
        }
      },
      error: () => {}
    });
  }

  startPolling(): void {
    this.stopPolling();
    this.pollingInterval = setInterval(() => {
      if (this.isOpen && this.conversation) {
        this.loadMessages(this.conversation.id, true);
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

    // Giới hạn 10MB
    if (file.size > 10 * 1024 * 1024) {
      this.message.warning('Tệp đính kèm không được vượt quá 10MB');
      return;
    }

    this.selectedFile = file;

    // Xem trước nếu là ảnh
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
    if (!this.conversation) return;
    const text = this.inputMessage.trim();
    if (!text && !this.selectedFile) return;

    this.isSending = true;
    const fileToSend = this.selectedFile;

    this.supportService.sendCitizenMessage(this.conversation.id, text, fileToSend).subscribe({
      next: (sentMsg) => {
        this.messages.push(sentMsg);
        this.inputMessage = '';
        this.removeSelectedFile();
        this.isSending = false;
        this.scrollToBottom();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSending = false;
        this.message.error(err?.error?.message || 'Gửi tin nhắn thất bại. Vui lòng thử lại.');
        this.cdr.detectChanges();
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
