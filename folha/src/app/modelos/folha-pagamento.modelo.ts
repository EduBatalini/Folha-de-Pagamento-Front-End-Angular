import { ItemFolha } from './item-folha.modelo';

// Status utilizados para controlar a situação da folha.
export type StatusFolha = 'ABERTA' | 'FECHADA';

// Dados da folha de pagamento de um funcionário.
export interface FolhaPagamento {
  id: string;
  nomeFuncionario: string;
  cargo: string;
  competencia: string; // AAAA-MM
  status: StatusFolha;
  itens: ItemFolha[];
  criadaEm: Date;
  atualizadaEm: Date;
}