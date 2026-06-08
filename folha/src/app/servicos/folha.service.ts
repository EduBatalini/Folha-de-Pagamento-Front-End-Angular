import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

import { FolhaPagamento, StatusFolha } from '../modelos/folha-pagamento.modelo';
import { ItemFolha } from '../modelos/item-folha.modelo';

/**
 * Serviço responsável por todas as operações relacionadas a folhas de pagamento.
 *
 * - Armazena os dados em memória (sem backend real)
 * - Simula chamadas assíncronas com RxJS + delay()
 * - Usa Angular Signals para expor o estado de forma reativa
 */
@Injectable({ providedIn: 'root' })
export class FolhaService {
  // Atraso (ms) usado para simular a latência de um backend real.
  private readonly atrasoSimulado = 250;

  // Lista de folhas mantida em memória.
  // O `signal` permite que componentes se atualizem automaticamente.
  private readonly listaFolhas = signal<FolhaPagamento[]>(this.dadosIniciais());

  // Signal público (somente leitura) com todas as folhas.
  readonly folhas = this.listaFolhas.asReadonly();

  // Signal computado: total de folhas abertas.
  readonly totalAbertas = computed(
    () => this.listaFolhas().filter((f) => f.status === 'ABERTA').length,
  );

  // Signal computado: total de folhas fechadas.
  readonly totalFechadas = computed(
    () => this.listaFolhas().filter((f) => f.status === 'FECHADA').length,
  );

  /** Lista todas as folhas, opcionalmente filtradas por status. */
  listar(statusFiltro?: StatusFolha): Observable<FolhaPagamento[]> {
    const dados = statusFiltro
      ? this.listaFolhas().filter((f) => f.status === statusFiltro)
      : this.listaFolhas();
    return of([...dados]).pipe(delay(this.atrasoSimulado));
  }

  /** Busca uma folha pelo id. */
  buscarPorId(id: string): Observable<FolhaPagamento> {
    const folha = this.listaFolhas().find((f) => f.id === id);
    if (!folha) {
      return throwError(() => new Error('Folha não encontrada.'));
    }
    return of(this.clonar(folha)).pipe(delay(this.atrasoSimulado));
  }

  /** Cria uma nova folha (sempre começa com status ABERTA). */
  criar(dados: Omit<FolhaPagamento, 'id' | 'status' | 'itens' | 'criadaEm' | 'atualizadaEm'>): Observable<FolhaPagamento> {
    const agora = new Date();
    const nova: FolhaPagamento = {
      ...dados,
      id: this.gerarId(),
      status: 'ABERTA',
      itens: [],
      criadaEm: agora,
      atualizadaEm: agora,
    };

    return of(nova).pipe(
      delay(this.atrasoSimulado),
      tap((folha) => this.listaFolhas.update((lista) => [...lista, folha])),
    );
  }

  /** Atualiza dados básicos da folha. Não permite alterar folha FECHADA. */
  atualizar(id: string, dados: Partial<Pick<FolhaPagamento, 'nomeFuncionario' | 'cargo' | 'competencia'>>): Observable<FolhaPagamento> {
    const folha = this.listaFolhas().find((f) => f.id === id);
    if (!folha) return throwError(() => new Error('Folha não encontrada.'));
    if (folha.status === 'FECHADA') {
      return throwError(() => new Error('Não é possível editar uma folha FECHADA. Reabra-a primeiro.'));
    }

    const atualizada: FolhaPagamento = { ...folha, ...dados, atualizadaEm: new Date() };
    return of(atualizada).pipe(
      delay(this.atrasoSimulado),
      tap(() => this.substituir(atualizada)),
    );
  }

  /** Remove uma folha pelo id. */
  remover(id: string): Observable<void> {
    return of(void 0).pipe(
      delay(this.atrasoSimulado),
      tap(() => this.listaFolhas.update((lista) => lista.filter((f) => f.id !== id))),
    );
  }

  /** Fecha uma folha. Só permite se o total líquido for maior que zero. */
  fechar(id: string): Observable<FolhaPagamento> {
    const folha = this.listaFolhas().find((f) => f.id === id);
    if (!folha) return throwError(() => new Error('Folha não encontrada.'));
    if (folha.status === 'FECHADA') {
      return throwError(() => new Error('A folha já está fechada.'));
    }
const liquido = this.calcularTotalLiquido(folha);
if (liquido <= 0) {
  return throwError(() => new Error('Só é possível fechar folhas com total líquido maior que zero.'));
}

    const fechada: FolhaPagamento = { ...folha, status: 'FECHADA', atualizadaEm: new Date() };
    return of(fechada).pipe(
      delay(this.atrasoSimulado),
      tap(() => this.substituir(fechada)),
    );
  }

  /** Reabre uma folha que estava fechada. */
  reabrir(id: string): Observable<FolhaPagamento> {
    const folha = this.listaFolhas().find((f) => f.id === id);
    if (!folha) return throwError(() => new Error('Folha não encontrada.'));
    if (folha.status === 'ABERTA') {
      return throwError(() => new Error('A folha já está aberta.'));
    }

    const reaberta: FolhaPagamento = { ...folha, status: 'ABERTA', atualizadaEm: new Date() };
    return of(reaberta).pipe(
      delay(this.atrasoSimulado),
      tap(() => this.substituir(reaberta)),
    );
  }

  // ---------------- Operações de Itens ----------------

  /** Adiciona um item (entrada ou desconto) à folha. */
  adicionarItem(folhaId: string, item: Omit<ItemFolha, 'id'>): Observable<ItemFolha> {
    const folha = this.listaFolhas().find((f) => f.id === folhaId);
    if (!folha) return throwError(() => new Error('Folha não encontrada.'));
    if (folha.status === 'FECHADA') {
      return throwError(() => new Error('Não é possível adicionar itens em uma folha FECHADA.'));
    }

    const novoItem: ItemFolha = { ...item, id: this.gerarId() };
    const folhaAtualizada: FolhaPagamento = {
      ...folha,
      itens: [...folha.itens, novoItem],
      atualizadaEm: new Date(),
    };

    return of(novoItem).pipe(
      delay(this.atrasoSimulado),
      tap(() => this.substituir(folhaAtualizada)),
    );
  }

  /** Atualiza um item existente. */
  atualizarItem(folhaId: string, itemId: string, dados: Partial<Omit<ItemFolha, 'id'>>): Observable<ItemFolha> {
    const folha = this.listaFolhas().find((f) => f.id === folhaId);
    if (!folha) return throwError(() => new Error('Folha não encontrada.'));
    if (folha.status === 'FECHADA') {
      return throwError(() => new Error('Não é possível editar itens de uma folha FECHADA.'));
    }

    const itemExistente = folha.itens.find((i) => i.id === itemId);
    if (!itemExistente) return throwError(() => new Error('Item não encontrado.'));

    const itemAtualizado: ItemFolha = { ...itemExistente, ...dados };
    const folhaAtualizada: FolhaPagamento = {
      ...folha,
      itens: folha.itens.map((i) => (i.id === itemId ? itemAtualizado : i)),
      atualizadaEm: new Date(),
    };

    return of(itemAtualizado).pipe(
      delay(this.atrasoSimulado),
      tap(() => this.substituir(folhaAtualizada)),
    );
  }

  /** Remove um item da folha. */
  removerItem(folhaId: string, itemId: string): Observable<void> {
    const folha = this.listaFolhas().find((f) => f.id === folhaId);
    if (!folha) return throwError(() => new Error('Folha não encontrada.'));
    if (folha.status === 'FECHADA') {
      return throwError(() => new Error('Não é possível remover itens de uma folha FECHADA.'));
    }

    const folhaAtualizada: FolhaPagamento = {
      ...folha,
      itens: folha.itens.filter((i) => i.id !== itemId),
      atualizadaEm: new Date(),
    };

    return of(void 0).pipe(
      delay(this.atrasoSimulado),
      tap(() => this.substituir(folhaAtualizada)),
    );
  }

  // ---------------- Cálculos auxiliares ----------------

  /** Soma de todos os ENTRADAS da folha. */
  calcularTotalEntradas(folha: FolhaPagamento): number {
    return folha.itens
      .filter((i) => i.tipo === 'ENTRADA')
      .reduce((acc, i) => acc + i.valor, 0);
  }

  /** Soma de todos os DESCONTOS da folha. */
  calcularTotalDescontos(folha: FolhaPagamento): number {
    return folha.itens
      .filter((i) => i.tipo === 'DESCONTO')
      .reduce((acc, i) => acc + i.valor, 0);
  }

  /** Total líquido = entradas - descontos. */
  calcularTotalLiquido(folha: FolhaPagamento): number {
    return this.calcularTotalEntradas(folha) - this.calcularTotalDescontos(folha);
  }

  // ---------------- Helpers privados ----------------

  private substituir(folha: FolhaPagamento): void {
    this.listaFolhas.update((lista) =>
      lista.map((f) => (f.id === folha.id ? folha : f)),
    );
  }

  private clonar(folha: FolhaPagamento): FolhaPagamento {
    return { ...folha, itens: folha.itens.map((i) => ({ ...i })) };
  }

  private gerarId(): string {
    return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  }

  /**
   * Estado inicial do "banco" em memória.
   * Sem folhas pré-cadastradas — a lista começa vazia.
   */
  private dadosIniciais(): FolhaPagamento[] {
    return [];
  }
}
