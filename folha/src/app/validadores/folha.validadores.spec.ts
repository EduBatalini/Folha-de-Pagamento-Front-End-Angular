import { FormControl } from '@angular/forms';
import {
  validadorCompetencia,
  validadorTamanhoTexto,
  validadorTextoNaoVazio,
  validadorValorPositivo,
} from './folha.validadores';

describe('Validadores de Folha', () => {
  describe('validadorTextoNaoVazio', () => {
    const validador = validadorTextoNaoVazio();

    it('deve invalidar texto vazio', () => {
      expect(validador(new FormControl(''))).toEqual({ textoVazio: true });
    });

    it('deve invalidar texto só com espaços', () => {
      expect(validador(new FormControl('   '))).toEqual({ textoVazio: true });
    });

    it('deve invalidar null', () => {
      expect(validador(new FormControl(null))).toEqual({ textoVazio: true });
    });

    it('deve aceitar texto válido', () => {
      expect(validador(new FormControl('João'))).toBeNull();
    });
  });

  describe('validadorValorPositivo', () => {
    const validador = validadorValorPositivo();

    it('deve invalidar zero', () => {
      expect(validador(new FormControl(0))).toEqual({ valorNaoPositivo: true });
    });

    it('deve invalidar negativo', () => {
      expect(validador(new FormControl(-10))).toEqual({ valorNaoPositivo: true });
    });

    it('deve invalidar não numérico', () => {
      expect(validador(new FormControl('abc'))).toEqual({ valorNaoPositivo: true });
    });

    it('deve aceitar positivo', () => {
      expect(validador(new FormControl(100.5))).toBeNull();
    });
  });

  describe('validadorCompetencia', () => {
    const validador = validadorCompetencia();

    it('deve aceitar formato AAAA-MM válido', () => {
      expect(validador(new FormControl('2025-01'))).toBeNull();
      expect(validador(new FormControl('2025-12'))).toBeNull();
    });

    it('deve invalidar mês inexistente', () => {
      expect(validador(new FormControl('2025-13'))).toEqual({ competenciaInvalida: true });
    });

    it('deve invalidar formato errado', () => {
      expect(validador(new FormControl('01/2025'))).toEqual({ competenciaInvalida: true });
    });
  });

  describe('validadorTamanhoTexto', () => {
    const validador = validadorTamanhoTexto(3, 5);

    it('deve aceitar texto dentro do intervalo', () => {
      expect(validador(new FormControl('abc'))).toBeNull();
      expect(validador(new FormControl('abcde'))).toBeNull();
    });

    it('deve rejeitar texto curto demais', () => {
      const erro = validador(new FormControl('ab'));
      expect(erro).toEqual({ tamanhoInvalido: { min: 3, max: 5, atual: 2 } });
    });

    it('deve rejeitar texto longo demais', () => {
      const erro = validador(new FormControl('abcdef'));
      expect(erro).toEqual({ tamanhoInvalido: { min: 3, max: 5, atual: 6 } });
    });

    it('deve ignorar espaços nas pontas ao medir', () => {
      expect(validador(new FormControl('  abc  '))).toBeNull();
    });
  });
});
