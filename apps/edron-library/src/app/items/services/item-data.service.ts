import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ItemDataset, TibiaItem } from '../models';

@Injectable({ providedIn: 'root' })
export class ItemDataService {
  private readonly http = inject(HttpClient);

  getItems(): Observable<TibiaItem[]> {
    return this.http
      .get<ItemDataset>('/assets/data/items.json')
      .pipe(map((dataset) => dataset.items));
  }

  getDataset(): Observable<ItemDataset> {
    return this.http.get<ItemDataset>('/assets/data/items.json');
  }
}
