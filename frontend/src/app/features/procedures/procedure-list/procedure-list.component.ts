import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { Procedure, ProcedureCategory } from '../../../core/models/procedure.model';
import { ProcedureService } from '../../../core/services/procedure.service';
import { INITIAL_CATEGORIES, INITIAL_PROCEDURES } from '../../../core/constants/procedures.data';

@Component({
  selector: 'app-procedure-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NzCardModule,
    NzGridModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzSelectModule,
    NzDividerModule,
    NzEmptyModule,
    NzSpinModule,
    NzPaginationModule
  ],
  templateUrl: './procedure-list.component.html',
  styleUrls: ['./procedure-list.component.scss']
})
export class ProcedureListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private procedureService = inject(ProcedureService);
  private cdr = inject(ChangeDetectorRef);

  searchQuery = '';
  selectedCategory: number | null = null;
  isLoading = false;

  pageIndex = 1;
  pageSize = 6;

  categories: ProcedureCategory[] = [...INITIAL_CATEGORIES];
  procedures: Procedure[] = [...INITIAL_PROCEDURES];
  filteredProcedures: Procedure[] = [...INITIAL_PROCEDURES];

  get pagedProcedures(): Procedure[] {
    const start = (this.pageIndex - 1) * this.pageSize;
    return this.filteredProcedures.slice(start, start + this.pageSize);
  }

  ngOnInit(): void {
    this.loadCategories();

    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchQuery = params['search'];
      }
      if (params['categoryId']) {
        this.selectedCategory = Number(params['categoryId']);
      }
      this.loadProcedures();
    });
  }

  loadCategories(): void {
    this.procedureService.getCategories().subscribe({
      next: (cats) => {
        if (cats && cats.length > 0) {
          this.categories = cats.map(c => ({
            ...c,
            icon: c.icon || 'solution'
          }));
        } else {
          this.categories = [...INITIAL_CATEGORIES];
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.categories = [...INITIAL_CATEGORIES];
        this.cdr.detectChanges();
      }
    });
  }

  loadProcedures(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.procedureService.getProcedures({
      keyword: this.searchQuery.trim() || undefined,
      categoryId: this.selectedCategory,
      size: 100
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res && res.content && res.content.length >= 0) {
          this.filteredProcedures = res.content;
        } else {
          this.fallbackFilter();
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.fallbackFilter();
        this.cdr.detectChanges();
      }
    });
  }

  filterProcedures(): void {
    this.pageIndex = 1;
    this.loadProcedures();
  }

  selectCategory(catId: number | null): void {
    this.pageIndex = 1;
    this.selectedCategory = catId;
    this.loadProcedures();
  }

  onPageIndexChange(page: number): void {
    this.pageIndex = page;
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 350, behavior: 'smooth' });
    }
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
  }

  private fallbackFilter(): void {
    this.filteredProcedures = this.procedures.filter(p => {
      const matchCategory = this.selectedCategory === null || Number(p.categoryId) === Number(this.selectedCategory);
      const matchQuery = !this.searchQuery.trim() ||
        p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (p.description?.toLowerCase() || '').includes(this.searchQuery.toLowerCase());
      return matchCategory && matchQuery;
    });
    this.cdr.detectChanges();
  }
}

