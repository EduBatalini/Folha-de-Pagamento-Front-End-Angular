import { Routes } from '@angular/router';

// Definição das rotas da aplicação.
// Usamos "loadComponent" para carregar os componentes de forma preguiçosa (lazy).
export const rotas: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'folhas',
  },
  {
    path: 'folhas',
    loadComponent: () =>
      import('./paginas/lista-folhas/lista-folhas.component').then(
        (m) => m.ListaFolhasComponent,
      ),
  },
  {
    path: 'folhas/:id',
    loadComponent: () =>
      import('./paginas/detalhes-folha/detalhes-folha.component').then(
        (m) => m.DetalhesFolhaComponent,
      ),
  },
  { path: '**', redirectTo: 'folhas' },
];
