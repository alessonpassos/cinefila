import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', title: 'Home · Cinefila', loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage) },
  { path: 'buscar', title: 'Buscar · Cinefila', loadComponent: () => import('./pages/buscar/buscar.page').then(m => m.BuscarPage) },
  { path: 'filmes/:id', title: 'Detalhes · Cinefila', loadComponent: () => import('./pages/detalhes/detalhes.page').then(m => m.DetalhesPage) },
  { path: 'minha-lista', title: 'Minha lista · Cinefila', loadComponent: () => import('./pages/minha-lista/minha-lista.page').then(m => m.MinhaListaPage) },
  { path: '**', redirectTo: 'home' }
];
