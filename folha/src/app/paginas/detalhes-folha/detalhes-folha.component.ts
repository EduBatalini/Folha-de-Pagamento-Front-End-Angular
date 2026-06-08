import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, switchMap } from 'rxjs/operators';

import { FolhaService } from '../../servicos/folha.service';
import { FolhaPagamento } from '../../modelos/folha-pagamento.modelo';
import { ItemFolha } from '../../modelos/item-folha.modelo';
import {
  FormularioItemComponent,
  ResultadoFormularioItem,
} from '../../componentes/formulario-item/formulario-item.component';
import { DialogoConfirmacaoComponent } from '../../componentes/dialogo-confirmacao/dialogo-confirmacao.component';

/**
 * Exibe os detalhes de uma folha de pagamento, incluindo
 * os itens cadastrados e os valores calculados.
 */
@Component({
  selector: 'app-detalhes-folha',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDividerModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  template: `
    <div class="linha-acoes" style="margin-bottom: 16px;">
      <a mat-stroked-button routerLink="/folhas">
        <mat-icon>arrow_back</mat-icon>
        Voltar
      </a>
    </div>

    @if (carregando()) {
      <mat-progress-bar mode="indeterminate" />
    }

    @if (folha(); as f) {
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ f.nomeFuncionario }}</mat-card-title>
          <mat-card-subtitle>
            {{ f.cargo }} • Competência {{ f.competencia }} •
            <span
              [class.status-aberta]="f.status === 'ABERTA'"
              [class.status-fechada]="f.status === 'FECHADA'"
            >
              {{ f.status }}
            </span>
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div class="linha-acoes" style="margin: 16px 0;">
            <button
              mat-flat-button
              color="primary"
              [disabled]="f.status === 'FECHADA'"
              (click)="adicionarItem()"
            >
              <mat-icon>add</mat-icon>
              Adicionar item
            </button>
          </div>

          @if (f.itens.length === 0) {
            <p style="text-align:center; padding:24px; color:#777;">
              Nenhum item lançado nesta folha.
            </p>
          } @else {
            <table mat-table [dataSource]="f.itens">
              <ng-container matColumnDef="descricao">
                <th mat-header-cell *matHeaderCellDef>Descrição</th>
                <td mat-cell *matCellDef="let item">{{ item.descricao }}</td>
              </ng-container>

              <ng-container matColumnDef="tipo">
                <th mat-header-cell *matHeaderCellDef>Tipo</th>
                <td mat-cell *matCellDef="let item">
                  {{ item.tipo === 'ENTRADA' ? 'Entrada' : 'Desconto' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="valor">
                <th mat-header-cell *matHeaderCellDef>Valor</th>
                <td mat-cell *matCellDef="let item">
                  {{ item.valor | currency:'BRL' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="acoes">
                <th mat-header-cell *matHeaderCellDef style="text-align:right;">Ações</th>
                <td mat-cell *matCellDef="let item" style="text-align:right;">
                  <button
                    mat-icon-button
                    [disabled]="f.status === 'FECHADA'"
                    (click)="editarItem(item)"
                    matTooltip="Editar"
                  >
                    <mat-icon>edit</mat-icon>
                  </button>

                  <button
                    mat-icon-button
                    color="warn"
                    [disabled]="f.status === 'FECHADA'"
                    (click)="removerItem(item)"
                    matTooltip="Remover"
                  >
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="colunas"></tr>
              <tr mat-row *matRowDef="let linha; columns: colunas;"></tr>
            </table>
          }

          <mat-divider style="margin: 16px 0;" />

          <div style="display:flex; gap:24px; flex-wrap:wrap;">
            <div>
              <strong>Entradas:</strong>
              {{ servico.calcularTotalEntradas(f) | currency:'BRL' }}
            </div>
            <div>
              <strong>Descontos:</strong>
              {{ servico.calcularTotalDescontos(f) | currency:'BRL' }}
            </div>
            <div style="font-size: 1.1rem;">
              <strong>Líquido:</strong>
              {{ servico.calcularTotalLiquido(f) | currency:'BRL' }}
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    }
  `,
})
export class DetalhesFolhaComponent implements OnInit {
  readonly servico = inject(FolhaService);
  private readonly rotaAtiva = inject(ActivatedRoute);
  private readonly roteador = inject(Router);
  private readonly dialogo = inject(MatDialog);
  private readonly notificacao = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  // Colunas exibidas na tabela de itens.
  readonly colunas = ['descricao', 'tipo', 'valor', 'acoes'];

  readonly carregando = signal(false);
  readonly folha = signal<FolhaPagamento | null>(null);

  private idFolha = '';

  ngOnInit(): void {
    this.idFolha = this.rotaAtiva.snapshot.paramMap.get('id') ?? '';
    this.recarregar();
  }

  // Atualiza os dados da folha exibida.
  private recarregar(): void {
    this.carregando.set(true);

    this.servico
      .buscarPorId(this.idFolha)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (f) => this.folha.set(f),
        error: (e) => {
          this.mostrarMensagem(e.message, true);
          this.roteador.navigate(['/folhas']);
        },
        complete: () => this.carregando.set(false),
      });
  }

  // Abre o formulário para adicionar um novo item.
  adicionarItem(): void {
    const ref = this.dialogo.open(FormularioItemComponent, {
      data: {},
    });

    ref
      .afterClosed()
      .pipe(
        filter((resultado) => !!resultado),
        switchMap((resultado: ResultadoFormularioItem) =>
          this.servico.adicionarItem(this.idFolha, resultado),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.mostrarMensagem('Item adicionado.');
          this.recarregar();
        },
        error: (e) => this.mostrarMensagem(e.message, true),
      });
  }

  // Abre o formulário preenchido para edição.
  editarItem(item: ItemFolha): void {
    const ref = this.dialogo.open(FormularioItemComponent, {
      data: { item },
    });

    ref
      .afterClosed()
      .pipe(
        filter((resultado) => !!resultado),
        switchMap((resultado: ResultadoFormularioItem) =>
          this.servico.atualizarItem(this.idFolha, item.id, resultado),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.mostrarMensagem('Item atualizado.');
          this.recarregar();
        },
        error: (e) => this.mostrarMensagem(e.message, true),
      });
  }

  // Solicita confirmação antes de remover o item.
  removerItem(item: ItemFolha): void {
    const ref = this.dialogo.open(DialogoConfirmacaoComponent, {
      data: {
        titulo: 'Remover item',
        mensagem: `Remover "${item.descricao}"?`,
        corConfirmar: 'warn',
      },
    });

    ref
      .afterClosed()
      .pipe(
        filter((ok) => !!ok),
        switchMap(() => this.servico.removerItem(this.idFolha, item.id)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.mostrarMensagem('Item removido.');
          this.recarregar();
        },
        error: (e) => this.mostrarMensagem(e.message, true),
      });
  }

  // Exibe uma notificação para o usuário.
  private mostrarMensagem(texto: string, erro = false): void {
    this.notificacao.open(texto, 'Fechar', {
      duration: 3500,
      panelClass: erro ? ['snack-erro'] : ['snack-ok'],
    });
  }
}