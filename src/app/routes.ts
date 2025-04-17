import { Routes } from '@angular/router';

export const ROUTES: Routes = [
  { path: '', redirectTo: 'lizard', pathMatch: 'full' },
  // { path: 'mandelbrot', loadChildren: () => import('../mandelbrot/routes').then(m => m.ROUTES) },
  // { path: 'something', loadChildren: () => import('../something/routes').then(m => m.ROUTES) },
  { path: 'lizard', loadChildren: () => import('../lizard/routes').then(m => m.ROUTES) },
];