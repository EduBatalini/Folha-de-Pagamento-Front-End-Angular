import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { FolhaPagamento } from '../../modelos/folha-pagamento.modelo';
import {
  validadorCompetencia,
  validadorTamanhoTexto,
  validadorTextoNaoVazio,
} from '../../validadores/folha.validadores';

// Dados recebidos ao abrir o formulário.
export interface DadosFormularioFolha {
  folha?: FolhaPagamento; // edição quando existir, cadastro quando não houver valor
}

// Dados retornados após salvar.
export interface ResultadoFormularioFolha {
  nomeFuncionario: string;
  cargo: string;
  competencia: string;
}

/**
 * Formulário utilizado para cadastrar ou editar uma folha de pagamento.
 */
@Component({
  selector: 'app-formulario-folha',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ dados.folha ? 'Editar folha' : 'Nova folha de pagamento' }}
    </h2>

    <form [formGroup]="formulario" (ngSubmit)="salvar()">
      <mat-dialog-content>
        <mat-form-field appearance="outline" class="campo-largura-total">
          <mat-label>Nome do funcionário</mat-label>
          <input matInput formControlName="nomeFuncionario" maxlength="200" />
          @if (folhaFechada) {
            <mat-hint>Folha fechada: o nome do funcionário não pode ser alterado.</mat-hint>
          }
          @if (campo('nomeFuncionario').touched && campo('nomeFuncionario').errors) {
            <mat-error>
              O nome é obrigatório e deve ter entre 3 e 200 caracteres.
            </mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="campo-largura-total">
          <mat-label>Cargo</mat-label>
          <input matInput formControlName="cargo" maxlength="80" />
          @if (campo('cargo').touched && campo('cargo').errors) {
            <mat-error>Informe um cargo válido.</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="campo-largura-total">
          <mat-label>Competência (AAAA-MM)</mat-label>
          <input matInput formControlName="competencia" placeholder="2025-01" />
          @if (campo('competencia').touched && campo('competencia').errors) {
            <mat-error>Use o formato AAAA-MM (ex.: 2025-01).</mat-error>
          }
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="cancelar()">Cancelar</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="formulario.invalid">
          Salvar
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [':host { display: block; min-width: 380px; }'],
})
export class FormularioFolhaComponent implements OnInit {
  formulario!: FormGroup;
  folhaFechada = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly referencia: MatDialogRef<FormularioFolhaComponent, ResultadoFormularioFolha>,
    @Inject(MAT_DIALOG_DATA) public readonly dados: DadosFormularioFolha,
  ) {}

  ngOnInit(): void {
    const f = this.dados.folha;
    this.folhaFechada = f?.status === 'FECHADA';

    this.formulario = this.fb.group({
      nomeFuncionario: [
        { value: f?.nomeFuncionario ?? '', disabled: this.folhaFechada },
        [Validators.required, validadorTextoNaoVazio(), validadorTamanhoTexto(3, 200)],
      ],
      cargo: [f?.cargo ?? '', [Validators.required, validadorTextoNaoVazio()]],
      competencia: [f?.competencia ?? '', [Validators.required, validadorCompetencia()]],
    });
  }

  campo(nome: string) {
    return this.formulario.get(nome)!;
  }

  salvar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    // Obtém todos os dados do formulário, inclusive campos desabilitados.
    const valor = this.formulario.getRawValue() as ResultadoFormularioFolha;

    this.referencia.close({
      nomeFuncionario: valor.nomeFuncionario.trim(),
      cargo: valor.cargo.trim(),
      competencia: valor.competencia.trim(),
    });
  }

  cancelar(): void {
    this.referencia.close();
  }
}