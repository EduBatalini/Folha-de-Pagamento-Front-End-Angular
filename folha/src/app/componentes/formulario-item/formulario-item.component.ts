import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { ItemFolha, TipoItem } from '../../modelos/item-folha.modelo';
import {
  validadorTamanhoTexto,
  validadorTextoNaoVazio,
  validadorValorPositivo,
} from '../../validadores/folha.validadores';

// Dados recebidos ao abrir o formulário.
export interface DadosFormularioItem {
  item?: ItemFolha; // edição quando informado
}

// Dados retornados após salvar.
export interface ResultadoFormularioItem {
  descricao: string;
  tipo: TipoItem;
  valor: number;
}

/**
 * Formulário utilizado para cadastrar ou editar um item da folha.
 */
@Component({
  selector: 'app-formulario-item',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ dados.item ? 'Editar item' : 'Novo item' }}</h2>

    <form [formGroup]="formulario" (ngSubmit)="salvar()">
      <mat-dialog-content>
        <mat-form-field appearance="outline" class="campo-largura-total">
          <mat-label>Descrição</mat-label>
          <input matInput formControlName="descricao" minlength="2" maxlength="50" />
          @if (campo('descricao').touched && campo('descricao').errors) {
            <mat-error>
              A descrição é obrigatória e deve ter entre 2 e 50 caracteres.
            </mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="campo-largura-total">
          <mat-label>Tipo</mat-label>
          <mat-select formControlName="tipo">
            <mat-option value="ENTRADA">Entrada (ganho)</mat-option>
            <mat-option value="DESCONTO">Desconto</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="campo-largura-total">
          <mat-label>Valor (R$)</mat-label>
          <input matInput type="number" min="0.01" step="0.01" formControlName="valor" />
          @if (campo('valor').touched && campo('valor').errors) {
            <mat-error>O valor é obrigatório e deve ser maior que zero.</mat-error>
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
export class FormularioItemComponent implements OnInit {
  formulario!: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly referencia: MatDialogRef<FormularioItemComponent, ResultadoFormularioItem>,
    @Inject(MAT_DIALOG_DATA) public readonly dados: DadosFormularioItem,
  ) {}

  ngOnInit(): void {
    const i = this.dados.item;

    this.formulario = this.fb.group({
      descricao: [
        i?.descricao ?? '',
        [Validators.required, validadorTextoNaoVazio(), validadorTamanhoTexto(2, 50)],
      ],
      tipo: [i?.tipo ?? 'ENTRADA', [Validators.required]],
      valor: [i?.valor ?? null, [Validators.required, validadorValorPositivo()]],
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

    const v = this.formulario.value as ResultadoFormularioItem;

    this.referencia.close({
      descricao: v.descricao.trim(),
      tipo: v.tipo,
      valor: Number(v.valor),
    });
  }

  cancelar(): void {
    this.referencia.close();
  }
}