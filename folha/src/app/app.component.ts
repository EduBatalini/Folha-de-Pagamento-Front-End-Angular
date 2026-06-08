import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Componente raiz da aplicação.
// É standalone (não precisa de NgModule).
@Component({
  selector: 'app-raiz',
  standalone: true,
  imports: [RouterOutlet, RouterLink, MatToolbarModule, MatIconModule, MatButtonModule],
  template: `
    <mat-toolbar color="primary">
      <mat-icon>payments</mat-icon>
      <span style="margin-left: 8px;">Folha de Pagamento</span>
      <span class="espacador"></span>
      <a mat-button routerLink="/folhas">
        <mat-icon>list</mat-icon>
        Folhas
      </a>
    </mat-toolbar>

    <main class="container-principal">
      <router-outlet />
    </main>
  `,
})
export class AppComponent {}
