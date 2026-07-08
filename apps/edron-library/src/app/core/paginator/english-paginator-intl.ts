import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable()
export class EnglishPaginatorIntl extends MatPaginatorIntl {
  override itemsPerPageLabel = 'Items per page';
  override nextPageLabel = 'Next page';
  override previousPageLabel = 'Previous page';
  override firstPageLabel = 'First page';
  override lastPageLabel = 'Last page';

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return `0 of ${length}`;
    }

    const start = page * pageSize;
    const end = Math.min(start + pageSize, length);
    return `${start + 1} - ${end} of ${length}`;
  };
}
