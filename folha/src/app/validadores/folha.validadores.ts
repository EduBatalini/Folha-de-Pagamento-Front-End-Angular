import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador que garante que o texto não seja vazio nem composto apenas por espaços.
 * Retorna { textoVazio: true } se for inválido.
 */
export function validadorTextoNaoVazio(): ValidatorFn {
  return (controle: AbstractControl): ValidationErrors | null => {
    const valor = controle.value;
    if (valor === null || valor === undefined) return { textoVazio: true };
    if (typeof valor !== 'string') return { textoVazio: true };
    return valor.trim().length === 0 ? { textoVazio: true } : null;
  };
}

/**
 * Validador de comprimento de texto (considera o texto SEM espaços nas pontas).
 * Retorna { tamanhoInvalido: { min, max, atual } } se inválido.
 */
export function validadorTamanhoTexto(min: number, max: number): ValidatorFn {
  return (controle: AbstractControl): ValidationErrors | null => {
    const valor = controle.value;
    if (typeof valor !== 'string') return { tamanhoInvalido: { min, max, atual: 0 } };
    const tamanho = valor.trim().length;
    if (tamanho < min || tamanho > max) {
      return { tamanhoInvalido: { min, max, atual: tamanho } };
    }
    return null;
  };
}

/**
 * Validador que garante que o valor numérico seja maior que zero.
 * Retorna { valorNaoPositivo: true } se for inválido.
 */
export function validadorValorPositivo(): ValidatorFn {
  return (controle: AbstractControl): ValidationErrors | null => {
    const valor = Number(controle.value);
    if (isNaN(valor)) return { valorNaoPositivo: true };
    return valor > 0 ? null : { valorNaoPositivo: true };
  };
}

/**
 * Validador para o campo competência no formato "AAAA-MM".
 */
export function validadorCompetencia(): ValidatorFn {
  return (controle: AbstractControl): ValidationErrors | null => {
    const valor = controle.value;
    if (typeof valor !== 'string') return { competenciaInvalida: true };
    const regex = /^\d{4}-(0[1-9]|1[0-2])$/;
    return regex.test(valor) ? null : { competenciaInvalida: true };
  };
}
