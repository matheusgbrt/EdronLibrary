import { Routes } from '@angular/router';

import { ItemBrowserPageComponent } from './items/pages/item-browser-page/item-browser-page.component';
import {
  ITEM_SEO_ROUTE_DEFINITIONS,
  ROOT_SEO_ROUTE
} from './items/services/item-seo-route.service';

export const routes: Routes = [
  {
    path: '',
    component: ItemBrowserPageComponent,
    data: { seoRoute: ROOT_SEO_ROUTE }
  },
  ...ITEM_SEO_ROUTE_DEFINITIONS.map((seoRoute) => ({
    path: seoRoute.path.slice(1),
    component: ItemBrowserPageComponent,
    data: { seoRoute }
  }))
];
