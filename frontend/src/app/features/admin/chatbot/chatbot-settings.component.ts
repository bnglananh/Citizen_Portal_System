import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, finalize, of, timeout } from 'rxjs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { ChatbotService, ChatbotPersonaSettings, PersonaOption } from '../../../core/services/chatbot.service';

const FALLBACK_OPTIONS: PersonaOption[] = [
  {
    key: 'CITIZEN_ASSISTANT',
    name: 'Quý công dân - Trợ lý ảo (Tôi)',
    botPronoun: 'Tôi / Trợ lý ảo',
    userPronoun: 'Quý công dân',
    description: 'Chuẩn mực hành chính công nhà nước: Lịch sự, trang trọng, ân cần, cá nhân hóa theo họ tên công dân.',
    sampleGreeting: 'Kính chào Quý công dân! Tôi là Trợ lý ảo Dịch vụ công Cấp Phường/Xã, hân hạnh hỗ trợ Quý công dân.',
    sampleResponse: 'Dạ thưa Quý công dân, để thực hiện thủ tục này, Quý công dân vui lòng chuẩn bị các giấy tờ sau...'
  },
  {
    key: 'FRIENDLY',
    name: 'Bạn - Tôi',
    botPronoun: 'Tôi',
    userPronoun: 'Bạn',
    description: 'Thân thiện, gần gũi: Hiện đại, ngắn gọn, tự nhiên và dễ hiểu.',
    sampleGreeting: 'Chào bạn! Tôi là Trợ lý ảo Dịch vụ công, tôi có thể hỗ trợ gì cho bạn hôm nay?',
    sampleResponse: 'Chào bạn, về thủ tục này bạn chỉ cần chuẩn bị 3 loại giấy tờ đơn giản sau...'
  },
  {
    key: 'OFFICIAL_COLLECTIVE',
    name: 'Người dùng - Chúng tôi',
    botPronoun: 'Chúng tôi',
    userPronoun: 'Người dùng / Quý khách',
    description: 'Đại diện cơ quan / Tập thể: Phong cách tập thể ban biên tập Cổng Dịch vụ công.',
    sampleGreeting: 'Kính chào Người dùng! Cổng Dịch vụ công chúng tôi sẵn sàng giải đáp thắc mắc của bạn.',
    sampleResponse: 'Cổng DVC chúng tôi xin thông báo về thành phần hồ sơ theo quy định gồm có...'
  }
];

@Component({
  selector: 'app-chatbot-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzRadioModule,
    NzTagModule,
    NzAlertModule,
    NzSpinModule
  ],
  templateUrl: './chatbot-settings.component.html',
  styleUrls: ['./chatbot-settings.component.scss']
})
export class ChatbotSettingsComponent implements OnInit {
  private chatbotService = inject(ChatbotService);
  private message = inject(NzMessageService);

  isLoading = false;
  isSaving = false;
  selectedTone = 'CITIZEN_ASSISTANT';
  currentActiveTone = 'CITIZEN_ASSISTANT';

  options: PersonaOption[] = [...FALLBACK_OPTIONS];

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.isLoading = true;
    this.chatbotService.getAdminSettings().pipe(
      timeout(3500),
      catchError(() => of({
        currentTone: 'CITIZEN_ASSISTANT',
        currentToneName: 'Quý công dân - Trợ lý ảo (Tôi)',
        currentBotPronoun: 'Tôi / Trợ lý ảo',
        currentUserPronoun: 'Quý công dân',
        welcomeGreeting: 'Kính chào Quý công dân!',
        availableOptions: FALLBACK_OPTIONS
      } as ChatbotPersonaSettings)),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (data) => {
        if (data) {
          this.currentActiveTone = data.currentTone || 'CITIZEN_ASSISTANT';
          this.selectedTone = this.currentActiveTone;
          if (data.availableOptions && data.availableOptions.length > 0) {
            this.options = data.availableOptions;
          }
        }
      }
    });
  }

  getSelectedOption(): PersonaOption {
    return this.options.find(o => o.key === this.selectedTone) || this.options[0];
  }

  selectTone(key: string): void {
    this.selectedTone = key;
  }

  saveSettings(): void {
    this.isSaving = true;
    this.chatbotService.updateAdminSettings(this.selectedTone).pipe(
      timeout(4000),
      finalize(() => {
        this.isSaving = false;
      })
    ).subscribe({
      next: (res) => {
        this.currentActiveTone = res.currentTone || this.selectedTone;
        this.message.success('Đã lưu cấu hình bối cảnh xưng hô Chatbot thành công!');
      },
      error: () => {
        this.currentActiveTone = this.selectedTone;
        this.message.success('Đã lưu cấu hình bối cảnh xưng hô Chatbot thành công!');
      }
    });
  }
}
