import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzUploadModule, NzUploadFile } from 'ng-zorro-antd/upload';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-file-uploader',
  standalone: true,
  imports: [CommonModule, NzUploadModule, NzIconModule, NzButtonModule],
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss']
})
export class FileUploaderComponent {
  @Input() documentName: string = 'Tài liệu đính kèm';
  @Input() description?: string;
  @Input() isRequired: boolean = true;
  @Input() accept: string = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
  @Input() maxSizeMb: number = 15;
  @Input() existingFileName?: string;

  @Output() fileChange = new EventEmitter<File | null>();
  @Output() filesChange = new EventEmitter<any[]>();

  selectedFile: File | null = null;
  displayFileName: string | null = null;
  fileSizeStr: string | null = null;

  constructor(private message: NzMessageService) {}

  beforeUpload = (file: NzUploadFile): boolean => {
    const rawFile = file as unknown as File;
    const isLtMax = rawFile.size / 1024 / 1024 < this.maxSizeMb;
    if (!isLtMax) {
      this.message.error(`Dung lượng tệp phải nhỏ hơn ${this.maxSizeMb}MB!`);
      return false;
    }

    this.selectedFile = rawFile;
    this.displayFileName = rawFile.name;
    this.fileSizeStr = (rawFile.size / 1024 / 1024).toFixed(2) + ' MB';
    this.fileChange.emit(this.selectedFile);
    return false; // Prevent automatic upload
  };

  removeFile(event: Event) {
    event.stopPropagation();
    this.selectedFile = null;
    this.displayFileName = null;
    this.fileSizeStr = null;
    this.fileChange.emit(null);
  }

  getFileIcon(name: string): string {
    const lower = (name || '').toLowerCase();
    if (lower.endsWith('.pdf')) return 'file-pdf';
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png')) return 'file-image';
    if (lower.endsWith('.doc') || lower.endsWith('.docx')) return 'file-word';
    return 'file';
  }
}
