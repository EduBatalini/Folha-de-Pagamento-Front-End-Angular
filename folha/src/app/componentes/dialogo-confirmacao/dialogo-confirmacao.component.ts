import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

// Informações exibidas na confirmação.
export interface DadosDialogoConfirmacao {
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  corConfirmar?: 'primary' | 'accent' | 'warn';
}

/**
 * Janela utilizada para confirmar ações do usuário.
 * Pode ser reutilizada em exclusões, fechamentos e outras operações.
 */
@Component({
  selector: 'app-dialogo-confirmacao',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ dados.titulo }}</h2>
    <mat-dialog-content>
      <p>{{ dados.mensagem }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancelar()">
        {{ dados.textoCancelar ?? 'Cancelar' }}
      </button>
      <button mat-flat-button [color]="dados.corConfirmar ?? 'primary'" (click)="confirmar()">
        {{ dados.textoConfirmar ?? 'Confirmar' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class DialogoConfirmacaoComponent {
  constructor(
    private readonly referencia: MatDialogRef<DialogoConfirmacaoComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public readonly dados: DadosDialogoConfirmacao,
  ) {}

  // Confirma a ação e retorna true.
  confirmar(): void {
    this.referencia.close(true);
  }

  // Fecha a janela sem confirmar a ação.
  cancelar(): void {
    this.referencia.close(false);
  }
}