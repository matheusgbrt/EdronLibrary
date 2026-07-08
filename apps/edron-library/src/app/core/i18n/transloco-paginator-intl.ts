import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslocoService } from '@jsverse/transloco';

@Injectable()
export class TranslocoPaginatorIntl extends MatPaginatorIntl {
  private readonly transloco = inject(TranslocoService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    super();
    this.updateLabels();

    this.transloco.langChanges$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.updateLabels();
        this.changes.next();
      });
  }

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return this.transloco.translate('items.results', {
        start: 0,
        end: 0,
        total: length
      });
    }

    const start = page * pageSize + 1;
    const end = Math.min(start + pageSize - 1, length);

    return this.transloco.translate('items.results', {
      start,
      end,
      total: length
    });
  };

  private updateLabels(): void {
    this.itemsPerPageLabel = this.transloco.translate('items.pageSize');
    this.nextPageLabel = this.transloco.translate('items.nextPage');
    this.previousPageLabel = this.transloco.translate('items.previousPage');
    this.firstPageLabel = this.transloco.translate('items.firstPage');
    this.lastPageLabel = this.transloco.translate('items.lastPage');
  }
}
