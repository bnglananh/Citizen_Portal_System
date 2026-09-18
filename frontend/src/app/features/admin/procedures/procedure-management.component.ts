import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Procedure, ProcedureCategory, RequiredDocument } from '../../../core/models/procedure.model';
import { ProcedureService } from '../../../core/services/procedure.service';

@Component({
  selector: 'app-procedure-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzCardModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzSelectModule,
    NzTagModule,
    NzSwitchModule,
    NzModalModule,
    NzFormModule,
    NzCheckboxModule
  ],
  templateUrl: './procedure-management.component.html',
  styleUrls: ['./procedure-management.component.scss']
})
export class ProcedureManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private message = inject(NzMessageService);
  private procedureService = inject(ProcedureService);

  searchQuery = '';
  selectedCategoryFilter: number | 'ALL' = 'ALL';

  categories: ProcedureCategory[] = [];
  procedures: Procedure[] = [];
  filteredProcedures: Procedure[] = [];

  pageIndex = 1;
  pageSize = 10;
  totalProcedures = 0;

  isModalVisible = false;
  isEditing = false;
  currentProcedureId: number | null = null;
  isLoading = false;

  procedureForm: FormGroup = this.fb.group({
    code: ['', [Validators.required]],
    name: ['', [Validators.required]],
    categoryId: [null, [Validators.required]],
    processingTimeDays: [1, [Validators.required, Validators.min(1)]],
    feeAmount: [0, [Validators.required, Validators.min(0)]],
    description: [''],
    stepsDescription: [''],
    requiredDocuments: this.fb.array([])
  });

  get requiredDocsArray(): FormArray {
    return this.procedureForm.get('requiredDocuments') as FormArray;
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProcedures();
  }

  loadCategories(): void {
    this.procedureService.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats || [];
      }
    });
  }

  loadProcedures(): void {
    this.isLoading = true;
    const catId = this.selectedCategoryFilter === 'ALL' ? null : this.selectedCategoryFilter;
    this.procedureService.getProcedures({
      keyword: this.searchQuery,
      categoryId: catId,
      page: this.pageIndex - 1,
      size: this.pageSize
    }).subscribe({
      next: (res) => {
        this.procedures = res.content || [];
        this.filteredProcedures = this.procedures;
        this.totalProcedures = res.totalElements || this.procedures.length;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  filterProcedures(): void {
    this.pageIndex = 1;
    this.loadProcedures();
  }

  // Document Builder helpers
  addDocumentField(name: string = '', isRequired: boolean = true, note: string = ''): void {
    this.requiredDocsArray.push(
      this.fb.group({
        documentName: [name, [Validators.required]],
        isRequired: [isRequired],
        note: [note]
      })
    );
  }

  removeDocumentField(index: number): void {
    this.requiredDocsArray.removeAt(index);
  }

  openAddModal(): void {
    this.isEditing = false;
    this.currentProcedureId = null;
    const defaultCatId = this.categories.length > 0 ? this.categories[0].id : 1;
    this.procedureForm.reset({
      categoryId: defaultCatId,
      processingTimeDays: 1,
      feeAmount: 0
    });
    this.requiredDocsArray.clear();
    this.addDocumentField('', true, '');
    this.isModalVisible = true;
  }

  openEditModal(proc: Procedure): void {
    this.isEditing = true;
    this.currentProcedureId = proc.id;
    this.procedureForm.patchValue({
      code: proc.code,
      name: proc.name,
      categoryId: proc.categoryId,
      processingTimeDays: proc.processingTimeDays,
      feeAmount: proc.feeAmount,
      description: proc.description,
      stepsDescription: proc.implementationSteps || proc.stepsDescription
    });

    this.requiredDocsArray.clear();
    if (proc.requiredDocuments && proc.requiredDocuments.length > 0) {
      proc.requiredDocuments.forEach(doc => {
        this.addDocumentField(doc.documentName, doc.isRequired, doc.note || '');
      });
    } else {
      this.addDocumentField('', true, '');
    }

    this.isModalVisible = true;
  }

  toggleActive(proc: Procedure): void {
    if (proc.active) {
      this.procedureService.deleteProcedure(proc.id).subscribe({
        next: () => {
          proc.active = false;
          this.message.success(`Đã ẩn thủ tục ${proc.code}`);
        },
        error: () => {
          this.message.error('Không thể cập nhật trạng thái thủ tục');
        }
      });
    } else {
      const payload = {
        code: proc.code,
        name: proc.name,
        categoryId: proc.categoryId,
        processingDurationDays: proc.processingTimeDays,
        fee: proc.feeAmount,
        description: proc.description,
        implementationSteps: proc.implementationSteps || proc.stepsDescription,
        conditions: proc.conditions || 'Theo quy định',
        legalBasis: proc.legalBasis || 'Theo quy định hiện hành',
        active: true,
        requiredDocuments: (proc.requiredDocuments || []).map((d, i) => ({
          documentName: d.documentName,
          required: d.isRequired,
          description: d.note,
          orderIndex: i + 1
        }))
      };
      this.procedureService.updateProcedure(proc.id, payload).subscribe({
        next: () => {
          proc.active = true;
          this.message.success(`Đã kích hoạt thủ tục ${proc.code}`);
        },
        error: () => {
          this.message.error('Không thể kích hoạt thủ tục');
        }
      });
    }
  }

  saveProcedure(): void {
    if (this.procedureForm.invalid) {
      Object.values(this.procedureForm.controls).forEach(c => c.markAsDirty());
      return;
    }

    this.isLoading = true;
    const formVal = this.procedureForm.getRawValue();

    const reqDocs = formVal.requiredDocuments.map((d: any, idx: number) => ({
      documentName: d.documentName,
      required: !!d.isRequired,
      description: d.note || '',
      orderIndex: idx + 1
    }));

    const payload = {
      code: formVal.code.trim().toUpperCase(),
      name: formVal.name.trim(),
      categoryId: formVal.categoryId,
      processingDurationDays: formVal.processingTimeDays,
      fee: formVal.feeAmount,
      description: formVal.description,
      implementationSteps: formVal.stepsDescription,
      conditions: 'Theo quy định của pháp luật hiện hành',
      legalBasis: 'Các văn bản quy phạm pháp luật liên quan',
      active: true,
      requiredDocuments: reqDocs
    };

    if (this.isEditing && this.currentProcedureId) {
      this.procedureService.updateProcedure(this.currentProcedureId, payload).subscribe({
        next: () => {
          this.message.success('Cập nhật thủ tục hành chính thành công!');
          this.isLoading = false;
          this.isModalVisible = false;
          this.loadProcedures();
        },
        error: (err) => {
          this.message.error(err?.error?.message || 'Cập nhật thủ tục thất bại');
          this.isLoading = false;
        }
      });
    } else {
      this.procedureService.createProcedure(payload).subscribe({
        next: () => {
          this.message.success('Tạo mới thủ tục hành chính thành công!');
          this.isLoading = false;
          this.isModalVisible = false;
          this.loadProcedures();
        },
        error: (err) => {
          this.message.error(err?.error?.message || 'Tạo mới thủ tục thất bại');
          this.isLoading = false;
        }
      });
    }
  }
}
