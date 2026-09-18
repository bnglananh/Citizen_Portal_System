import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ChatMessage, ChatbotService, QuickPrompt } from '../../../core/services/chatbot.service';

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NzIconModule,
    NzButtonModule,
    NzInputModule,
    NzBadgeModule,
    NzTooltipModule,
    NzSpinModule
  ],
  templateUrl: './chatbot-widget.component.html',
  styleUrls: ['./chatbot-widget.component.scss']
})
export class ChatbotWidgetComponent implements OnInit {
  private chatbotService = inject(ChatbotService);
  private messageService = inject(NzMessageService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  isOpen = false;
  inputMessage = '';
  isLoading = false;
  messages: ChatMessage[] = [];
  quickPrompts: QuickPrompt[] = [];

  ngOnInit(): void {
    this.loadQuickPrompts();
    this.initWelcomeMessage();
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      setTimeout(() => this.scrollToBottom(), 150);
    }
  }

  loadQuickPrompts(): void {
    this.chatbotService.getQuickPrompts().subscribe({
      next: (prompts) => {
        this.quickPrompts = prompts;
      },
      error: () => {
        // Fallback default prompts
        this.quickPrompts = [
          { label: 'Đăng ký khai sinh', prompt: 'Tôi muốn đăng ký khai sinh cho con thì cần chuẩn bị giấy tờ gì và thời gian xử lý bao lâu?', category: 'Hộ tịch' },
          { label: 'Đăng ký kết hôn', prompt: 'Quy trình và hồ sơ cần nộp khi đăng ký kết hôn trực tuyến gồm những gì?', category: 'Hộ tịch' },
          { label: 'Cấp lại BHYT', prompt: 'Hướng dẫn tôi nộp hồ sơ xin cấp lại thẻ BHYT do bị hỏng hoặc mất.', category: 'Bảo trợ' },
          { label: 'Tra cứu hồ sơ của tôi', prompt: 'Hồ sơ thủ tục của tôi hiện tại đang ở trạng thái nào và tiến độ xử lý ra sao?', category: 'Hồ sơ' }
        ];
      }
    });
  }

  initWelcomeMessage(): void {
    if (this.messages.length === 0) {
      this.chatbotService.getPublicPersona().subscribe({
        next: (persona) => {
          const greeting = persona?.welcomeGreeting || '👋 Xin chào Quý công dân! Tôi là **Trợ lý ảo Dịch vụ công Cấp Phường/Xã**.\n\nTôi có thể hỗ trợ tra cứu thủ tục hành chính, giải thích giấy tờ cần chuẩn bị và theo dõi tiến độ hồ sơ của bạn.\n\nHãy gửi câu hỏi hoặc chọn các câu hỏi gợi ý bên dưới để được hướng dẫn ngay nhé!';
          if (this.messages.length === 0) {
            this.messages = [
              {
                senderType: 'AI',
                content: greeting,
                createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
              }
            ];
          }
        },
        error: () => {
          if (this.messages.length === 0) {
            this.messages = [
              {
                senderType: 'AI',
                content: '👋 Xin chào Quý công dân! Tôi là **Trợ lý ảo Dịch vụ công Cấp Phường/Xã**.\n\nTôi có thể hỗ trợ tra cứu thủ tục hành chính, giải thích giấy tờ cần chuẩn bị và theo dõi tiến độ hồ sơ của bạn.\n\nHãy gửi câu hỏi hoặc chọn các câu hỏi gợi ý bên dưới để được hướng dẫn ngay nhé!',
                createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
              }
            ];
          }
        }
      });
    }
  }

  selectPrompt(promptText: string): void {
    this.inputMessage = promptText;
    this.sendMessage();
  }

  sendMessage(): void {
    const text = this.inputMessage.trim();
    if (!text || this.isLoading) return;

    // Push User message
    const userMsg: ChatMessage = {
      senderType: 'USER',
      content: text,
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
    this.messages.push(userMsg);
    this.inputMessage = '';
    this.isLoading = true;
    this.cdr.detectChanges();
    setTimeout(() => this.scrollToBottom(), 100);

    this.chatbotService.sendMessage(text).subscribe({
      next: (reply) => {
        this.isLoading = false;
        this.messages.push({
          ...reply,
          createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        });
        this.cdr.detectChanges();
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err) => {
        this.isLoading = false;
        this.messages.push({
          senderType: 'AI',
          content: '⚠️ Xin lỗi quý công dân, hiện tại hệ thống kết nối AI đang bận. Bạn vui lòng thử lại sau giây lát hoặc sử dụng tính năng **Tra cứu thủ tục** trên thanh menu.',
          createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        });
        this.cdr.detectChanges();
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
  }

  resetChat(): void {
    const convId = this.chatbotService.currentConversationId;
    if (convId) {
      this.chatbotService.clearConversation(convId).subscribe();
    }
    this.chatbotService.setConversationId(null);
    this.messages = [];
    this.initWelcomeMessage();
    this.messageService.success('Đã làm mới cuộc hội thoại');
  }

  copyContent(text: string): void {
    navigator.clipboard.writeText(text);
    this.messageService.success('Đã sao chép nội dung');
  }

  formatContent(content: string): string {
    if (!content) return '';
    let escaped = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Headings: ### Tiêu đề
    escaped = escaped.replace(/^### (.*$)/gim, '<div class="chat-heading">$1</div>');
    escaped = escaped.replace(/^## (.*$)/gim, '<div class="chat-heading">$1</div>');

    // Markdown Links: [Tên link](url)
    escaped = escaped.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="chat-link" target="_blank">$1</a>');

    // Bold **text**
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic *text*
    escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Code `code`
    escaped = escaped.replace(/`(.*?)`/g, '<code>$1</code>');
    // Bullet list - item
    escaped = escaped.replace(/^- (.*$)/gim, '<span class="bullet-item">• $1</span>');
    // Newlines to <br>
    escaped = escaped.replace(/\n/g, '<br>');

    return escaped;
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {}
  }
}
