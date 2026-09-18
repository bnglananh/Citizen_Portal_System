import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Procedure } from '../../../core/models/procedure.model';
import { ProcedureService } from '../../../core/services/procedure.service';
import { INITIAL_PROCEDURES, getAllowedFileExtensionsStr } from '../../../core/constants/procedures.data';

@Component({
  selector: 'app-procedure-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzCardModule,
    NzTabsModule,
    NzCollapseModule,
    NzDescriptionsModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzTableModule,
    NzBreadCrumbModule,
    NzSpinModule
  ],
  templateUrl: './procedure-detail.component.html',
  styleUrls: ['./procedure-detail.component.scss']
})
export class ProcedureDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private procedureService = inject(ProcedureService);

  procedureId = 1;
  isLoading = false;

  procedure: Procedure = INITIAL_PROCEDURES[0];

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.procedureId = +id;
        const localProc = INITIAL_PROCEDURES.find(p => p.id === this.procedureId || p.code === id);
        if (localProc) {
          this.procedure = localProc;
        }
        this.loadProcedureDetail();
      }
    });
  }

  loadProcedureDetail(): void {
    this.isLoading = true;
    this.procedureService.getProcedureById(this.procedureId).subscribe({
      next: (proc) => {
        this.isLoading = false;
        if (proc) {
          this.procedure = {
            ...proc,
            implementationSteps: proc.implementationSteps || this.procedure.implementationSteps,
            conditions: proc.conditions || this.procedure.conditions,
            legalBasis: proc.legalBasis || this.procedure.legalBasis,
            stepsDescription: proc.implementationSteps || proc.stepsDescription || this.procedure.stepsDescription
          };
        }
      },
      error: () => {
        this.isLoading = false;
        const local = INITIAL_PROCEDURES.find(p => p.id === this.procedureId);
        if (local) {
          this.procedure = local;
        }
      }
    });
  }

  getDocFormat(docName: string): string {
    return getAllowedFileExtensionsStr(docName);
  }
}

