import { Component, OnInit, computed, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, switchMap } from 'rxjs/operators';

import { FolhaService } from '../../servicos/folha.service';
import { FolhaPagamento, StatusFolha } from '../../modelos/folha-pagamento.modelo';
import {
  FormularioFolhaComponent,
  ResultadoFormularioFolha,
} from '../../componentes/formulario-folha/formulario-folha.component';
import { DialogoConfirmacaoComponent } from '../../componentes/dialogo-confirmacao/dialogo-confirmacao.component';

/**
 * Tela principal para gerenciamento das folhas de pagamento.
 */
@Component({
  selector: 'app-lista-folhas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatButtonToggleModule,
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Folhas de pagamento</mat-card-title>
        <mat-card-subtitle>
          {{ servico.totalAbertas() }} aberta(s) • {{ servico.totalFechadas() }} fechada(s)
        </mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <div class="linha-acoes" style="margin: 16px 0;">
          <mat-button-toggle-group [value]="filtroStatus()" (change)="aoMudarFiltro($event.value)">
            <mat-button-toggle value="TODAS">Todas</mat-button-toggle>
            <mat-button-toggle value="ABERTA">Abertas</mat-button-toggle>
            <mat-button-toggle value="FECHADA">Fechadas</mat-button-toggle>
          </mat-button-toggle-group>

          <span class="espacador"></span>

          <button mat-flat-button color="primary" (click)="abrirNovaFolha()">
            <mat-icon>add</mat-icon>
            Nova folha
          </button>
        </div>

        @if (carregando()) {
          <mat-progress-bar mode="indeterminate" />
        }

        @if (folhasFiltradas().length === 0 && !carregando()) {
          <p style="text-align:center; padding:24px; color:#777;">
            Nenhuma folha encontrada.
          </p>
        } @else {
          <table mat-table [dataSource]="folhasFiltradas()">
            <ng-container matColumnDef="funcionario">
              <th mat-header-cell *matHeaderCellDef>Funcionário</th>
              <td mat-cell *matCellDef="let folha">{{ folha.nomeFuncionario }}</td>
            </ng-container>

            <ng-container matColumnDef="cargo">
              <th mat-header-cell *matHeaderCellDef>Cargo</th>
              <td mat-cell *matCellDef="let folha">{{ folha.cargo }}</td>
            </ng-container>

            <ng-container matColumnDef="competencia">
              <th mat-header-cell *matHeaderCellDef>Competência</th>
              <td mat-cell *matCellDef="let folha">{{ folha.competencia }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let folha">
                <span
                  [class.status-aberta]="folha.status === 'ABERTA'"
                  [class.status-fechada]="folha.status === 'FECHADA'"
                >
                  {{ folha.status }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="liquido">
              <th mat-header-cell *matHeaderCellDef>Líquido</th>
              <td mat-cell *matCellDef="let folha">
                {{ servico.calcularTotalLiquido(folha) | currency:'BRL' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="acoes">
              <th mat-header-cell *matHeaderCellDef style="text-align:right;">Ações</th>
              <td mat-cell *matCellDef="let folha" style="text-align:right;">
                <a
                  mat-icon-button
                  color="primary"
                  [routerLink]="['/folhas', folha.id]"
                  matTooltip="Ver detalhes"
                >
                  <mat-icon>visibility</mat-icon>
                </a>

                @if (folha.status === 'ABERTA') {
                  <button mat-icon-button (click)="editar(folha)" matTooltip="Editar">
                    <mat-icon>edit</mat-icon>
                  </button>

                  <button
                    mat-icon-button
                    color="accent"
                    (click)="fechar(folha)"
                    matTooltip="Fechar folha"
                  >
                    <mat-icon>lock</mat-icon>
                  </button>
                } @else {
                  <button
                    mat-icon-button
                    color="primary"
                    (click)="reabrir(folha)"
                    matTooltip="Reabrir folha"
                  >
                    <mat-icon>lock_open</mat-icon>
                  </button>
                }

                <button
                  mat-icon-button
                  color="warn"
                  (click)="remover(folha)"
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
      </mat-card-content>
    </mat-card>
  `,
})
export class ListaFolhasComponent implements OnInit {
  // Serviços utilizados pelo componente.
  readonly servico = inject(FolhaService);
  private readonly dialogo = inject(MatDialog);
  private readonly notificacao = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  readonly colunas = ['funcionario', 'cargo', 'competencia', 'status', 'liquido', 'acoes'];

  // Filtro aplicado na listagem.
  readonly filtroStatus = signal<'TODAS' | StatusFolha>('TODAS');

  // Controle de carregamento da tela.
  readonly carregando = signal(false);

  // Folhas exibidas conforme o filtro selecionado.
  readonly folhasFiltradas = computed(() => {
    const todas = this.servico.folhas();
    const filtro = this.filtroStatus();

    if (filtro === 'TODAS') {
      return todas;
    }

    return todas.filter((f) => f.status === filtro);
  });

  ngOnInit(): void {
    this.carregando.set(true);

    this.servico
      .listar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        complete: () => this.carregando.set(false),
        error: () => this.carregando.set(false),
      });
  }

  aoMudarFiltro(novo: 'TODAS' | StatusFolha): void {
    this.filtroStatus.set(novo);
  }

  // Abre o formulário para criação de uma nova folha.
  abrirNovaFolha(): void {
    const ref = this.dialogo.open(FormularioFolhaComponent, {
      data: {},
    });

    ref
      .afterClosed()
      .pipe(
        filter((resultado) => !!resultado),
        switchMap((resultado: ResultadoFormularioFolha) => {
          this.carregando.set(true);
          return this.servico.criar(resultado);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.mostrarMensagem('Folha criada com sucesso.'),
        error: (e) => this.mostrarMensagem(e.message, true),
        complete: () => this.carregando.set(false),
      });
  }

  // Abre o formulário preenchido para edição.
  editar(folha: FolhaPagamento): void {
    const ref = this.dialogo.open(FormularioFolhaComponent, {
      data: { folha },
    });

    ref
      .afterClosed()
      .pipe(
        filter((resultado) => !!resultado),
        switchMap((resultado: ResultadoFormularioFolha) =>
          this.servico.atualizar(folha.id, resultado),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.mostrarMensagem('Folha atualizada.'),
        error: (e) => this.mostrarMensagem(e.message, true),
      });
  }

  // Solicita confirmação antes de fechar a folha.
  fechar(folha: FolhaPagamento): void {
    this.confirmar(
      'Fechar folha',
      `Deseja realmente fechar a folha de ${folha.nomeFuncionario}? Após fechada, não será possível editá-la sem reabrir.`,
    )
      .pipe(
        filter((ok) => !!ok),
        switchMap(() => this.servico.fechar(folha.id)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.mostrarMensagem('Folha fechada.'),
        error: (e) => this.mostrarMensagem(e.message, true),
      });
  }

  // Reabre uma folha já fechada.
  reabrir(folha: FolhaPagamento): void {
    this.confirmar(
      'Reabrir folha',
      `Deseja reabrir a folha de ${folha.nomeFuncionario}?`,
    )
      .pipe(
        filter((ok) => !!ok),
        switchMap(() => this.servico.reabrir(folha.id)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.mostrarMensagem('Folha reaberta.'),
        error: (e) => this.mostrarMensagem(e.message, true),
      });
  }

  // Solicita confirmação antes da exclusão.
  remover(folha: FolhaPagamento): void {
    this.confirmar(
      'Remover folha',
      `Tem certeza que deseja remover a folha de ${folha.nomeFuncionario}? Esta ação não pode ser desfeita.`,
    )
      .pipe(
        filter((ok) => !!ok),
        switchMap(() => this.servico.remover(folha.id)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.mostrarMensagem('Folha removida.'),
        error: (e) => this.mostrarMensagem(e.message, true),
      });
  }

  // Exibe uma janela de confirmação.
  private confirmar(titulo: string, mensagem: string) {
    return this.dialogo
      .open(DialogoConfirmacaoComponent, {
        data: {
          titulo,
          mensagem,
          corConfirmar: 'warn',
        },
      })
      .afterClosed();
  }

  // Exibe uma notificação para o usuário.
  private mostrarMensagem(texto: string, erro = false): void {
    this.notificacao.open(texto, 'Fechar', {
      duration: 3500,
      panelClass: erro ? ['snack-erro'] : ['snack-ok'],
    });
  }
}