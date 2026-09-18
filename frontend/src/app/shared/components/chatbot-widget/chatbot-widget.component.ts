import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzSpinModule } from 'ng-zorro-antd/spin';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzTagModule,
    NzAvatarModule,
    NzSpinModule
  ],
  templateUrl: './chatbot-widget.component.html',
  styleUrls: ['./chatbot-widget.component.scss']
})
export class ChatbotWidgetComponent implements AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer?: ElementRef;

  isOpen = false;
  isLoading = false;
  inputText = '';

  quickSuggestions: string[] = [
    'Thủ tục cấp lại GPLX cần giấy tờ gì?',
    'Thời hạn giải quyết cấp đổi CCCD?',
    'Cách tra cứu hồ sơ trực tuyến',
    'Mức thu lệ phí hộ khẩu thường trú'
  ];

  messages: ChatMessage[] = [
    {
      sender: 'bot',
      text: 'Xin chào Quý công dân! Tôi là **Trợ lý Ảo Dịch vụ công Phường Tân Phú**. Tôi có thể hỗ trợ giải đáp quy trình, thành phần hồ sơ và thời hạn giải quyết các thủ tục hành chính tại UBND Phường Tân Phú, TP. Hồ Chí Minh. Bạn đang cần hỗ trợ thủ tục nào?',
      time: 'Vừa xong'
    }
  ];


  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('open-dvc-chatbot', () => {
        this.isOpen = true;
        setTimeout(() => this.scrollToBottom(), 100);
      });
    }
  }

  ngAfterViewChecked(): void {
    if (this.isOpen) {
      this.scrollToBottom();
    }
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  sendMessage(textToSend?: string): void {
    const text = textToSend || this.inputText.trim();
    if (!text || this.isLoading) return;

    // Add user message
    this.messages.push({
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    this.inputText = '';
    this.isLoading = true;

    // Simulate AI response
    setTimeout(() => {
      let botResponse = '';
      const lower = text.toLowerCase();

      if (lower.includes('gplx') || lower.includes('giấy phép lái xe')) {
        botResponse = `Về thủ tục **Đổi giấy phép lái xe do ngành Giao thông vận tải cấp**:\n- **Thời hạn giải quyết:** 05 ngày làm việc\n- **Phí/Lệ phí:** 135.000 VNĐ\n- **Hồ sơ gồm:**\n  1. Đơn đề nghị đổi GPLX theo mẫu\n  2. Giấy khám sức khỏe người lái xe (còn hạn 6 tháng)\n  3. Bản sao CMND/CCCD hoặc Hộ chiếu\n  4. Bản sao GPLX hiện tại`;
      } else if (lower.includes('cccd') || lower.includes('căn cước')) {
        botResponse = `Về thủ tục **Cấp, đổi, cấp lại thẻ Căn cước công dân**:\n- **Thời hạn giải quyết:** Tối đa 07 ngày làm việc tại đô thị, 20 ngày tại vùng sâu, vùng xa\n- **Nơi tiếp nhận:** Công an cấp quận/huyện hoặc trực tuyến qua Cổng Dịch vụ công Bộ Công an\n- **Hồ sơ:** Phiếu thu nhận thông tin CCCD (mẫu DC01), không cần nộp giấy tờ nếu thông tin trên CSDL Dân cư đã chính xác.`;
      } else if (lower.includes('tra cứu')) {
        botResponse = `Để **tra cứu tiến độ hồ sơ**, bạn có thể:\n1. Bấm vào mục **Tra cứu hồ sơ** trên thanh menu\n2. Nhập chính xác **Mã hồ sơ** (ví dụ: *HS2026090123*)\n3. Hệ thống sẽ hiển thị toàn bộ tiến trình thẩm định và kết quả hiện tại.`;
      } else {
        botResponse = `Cảm ơn câu hỏi của bạn về **"${text}"**.\nTheo quy định của Bộ thủ tục hành chính, bạn vui lòng tra cứu trực tiếp trong mục **Danh mục thủ tục** hoặc liên hệ tổng đài **1900 6868** để được cán bộ nghiệp vụ hướng dẫn cụ thể.`;
      }

      this.messages.push({
        sender: 'bot',
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      this.isLoading = false;
    }, 700);
  }

  selectSuggestion(suggestion: string): void {
    this.sendMessage(suggestion);
  }

  private scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch {}
  }
}
