// Tipo utilizado para identificar se o item é um ganho ou desconto.
export type TipoItem = 'ENTRADA' | 'DESCONTO';

// Dados de um item da folha de pagamento.
export interface ItemFolha {
  id: string;
  descricao: string; 
  tipo: TipoItem;
  valor: number; 
}