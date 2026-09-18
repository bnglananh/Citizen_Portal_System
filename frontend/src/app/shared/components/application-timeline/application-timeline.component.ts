import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';

export interface TimelineItem {
  id?: number;
  fromStatus?: string;
  toStatus: string;
  actionName: string;
  comments?: string;
  actionByUserName?: string;
  actionByUserFullName?: string;
  actionTime: string | Date;
}

@Component({
  selector: 'app-application-timeline',
  standalone: true,
  imports: [CommonModule, NzTimelineModule, NzIconModule, NzTagModule],
  templateUrl: './application-timeline.component.html',
  styleUrls: ['./application-timeline.component.scss']
})
export class ApplicationTimelineComponent {
  @Input() history: any[] = [];
  @Input() set historyList(val: any[]) {
    if (val) this.history = val;
  }
  get historyList(): any[] {
    return this.history;
  }
  @Input() currentStatus?: string;

  getDotColor(status: string, isLatest: boolean): string {
    if (status === 'REJECTED') return '#9E2A2B';
    if (status === 'COMPLETED') return '#2F5D45';
    if (status === 'NEED_REVISION') return '#A04A15';
    if (status === 'PROCESSING') return '#C99A3C';
    return '#2F5D45';
  }

  getDotIcon(status: string): string {
    switch (status) {
      case 'DRAFT': return 'edit';
      case 'SUBMITTED': return 'send';
      case 'RECEIVED': return 'inbox';
      case 'PROCESSING': return 'sync';
      case 'NEED_REVISION': return 'exclamation-circle';
      case 'RESUBMITTED': return 'redo';
      case 'COMPLETED': return 'check-circle';
      case 'REJECTED': return 'close-circle';
      default: return 'clock-circle';
    }
  }
}
