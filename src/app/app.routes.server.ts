import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // {
  //   path: 'search/:id',
  //   renderMode: RenderMode.Client,
  // },
  // {
  //   path: 'grave/edit/:id',
  //   renderMode: RenderMode.Client,
  // },
  // {
  //   path: 'grave/:id',
  //   renderMode: RenderMode.Client,
  // },
  // {
  //   path: 'grave/management',
  //   renderMode: RenderMode.Prerender,
  // },
  // {
  //   path: 'grave/management/new',
  //   renderMode: RenderMode.Client,
  // },
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
