import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map, timeout } from 'rxjs';

export interface ChatMessage {
  id?: number;
  conversationId?: number;
  senderType: 'USER' | 'AI';
  content: string;
  referencedProcedureId?: number;
  referencedApplicationId?: number;
  createdAt?: string;
}

export interface QuickPrompt {
  label: string;
  prompt: string;
  category: string;
}

export interface PersonaOption {
  key: string;
  name: string;
  botPronoun: string;
  userPronoun: string;
  description: string;
  sampleGreeting: string;
  sampleResponse: string;
}

export interface ChatbotPersonaSettings {
  currentTone: string;
  currentToneName: string;
  currentBotPronoun: string;
  currentUserPronoun: string;
  welcomeGreeting: string;
  availableOptions: PersonaOption[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private http = inject(HttpClient);
  private readonly apiUrl = '/api/chat';

  private conversationIdSubject = new BehaviorSubject<number | null>(this.getStoredConversationId());
  public conversationId$ = this.conversationIdSubject.asObservable();

  get currentConversationId(): number | null {
    return this.conversationIdSubject.value;
  }

  setConversationId(id: number | null): void {
    if (id) {
      sessionStorage.setItem('dvc_chat_conv_id', id.toString());
    } else {
      sessionStorage.removeItem('dvc_chat_conv_id');
    }
    this.conversationIdSubject.next(id);
  }

  private getStoredConversationId(): number | null {
    const stored = sessionStorage.getItem('dvc_chat_conv_id');
    return stored ? parseInt(stored, 10) : null;
  }

  sendMessage(message: string, conversationId?: number | null): Observable<ChatMessage> {
    const convId = conversationId !== undefined ? conversationId : this.currentConversationId;
    return this.http.post<ApiResponse<ChatMessage>>(`${this.apiUrl}/message`, {
      message,
      conversationId: convId
    }).pipe(
      timeout(12000),
      map(res => {
        if (res.data?.conversationId) {
          this.setConversationId(res.data.conversationId);
        }
        return res.data;
      })
    );
  }

  getConversationHistory(conversationId: number): Observable<ChatMessage[]> {
    return this.http.get<ApiResponse<{ messages: ChatMessage[] }>>(`${this.apiUrl}/history/${conversationId}`).pipe(
      map(res => res.data?.messages || [])
    );
  }

  getQuickPrompts(): Observable<QuickPrompt[]> {
    return this.http.get<ApiResponse<QuickPrompt[]>>(`${this.apiUrl}/quick-prompts`).pipe(
      map(res => res.data || [])
    );
  }

  getPublicPersona(): Observable<ChatbotPersonaSettings> {
    return this.http.get<ApiResponse<ChatbotPersonaSettings>>(`${this.apiUrl}/persona`).pipe(
      map(res => res.data)
    );
  }

  getAdminSettings(): Observable<ChatbotPersonaSettings> {
    return this.http.get<ApiResponse<ChatbotPersonaSettings>>(`${this.apiUrl}/admin/settings`).pipe(
      map(res => res.data)
    );
  }

  updateAdminSettings(toneKey: string): Observable<ChatbotPersonaSettings> {
    return this.http.put<ApiResponse<ChatbotPersonaSettings>>(`${this.apiUrl}/admin/settings`, { toneKey }).pipe(
      map(res => res.data)
    );
  }

  clearConversation(conversationId: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/history/${conversationId}`).pipe(
      map(() => {
        this.setConversationId(null);
      })
    );
  }
}
