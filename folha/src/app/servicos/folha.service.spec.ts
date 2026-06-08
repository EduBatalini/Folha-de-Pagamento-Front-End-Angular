import { TestBed } from '@angular/core/testing';
import { FolhaService } from './folha.service';

describe('FolhaService', () => {
  let servico: FolhaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    servico = TestBed.inject(FolhaService);
  });

  it('deve ser criado', () => {
    expect(servico).toBeTruthy();
  });

  it('deve listar folhas (lista pode estar vazia inicialmente)', (done) => {
    servico.listar().subscribe((folhas) => {
      expect(Array.isArray(folhas)).toBeTrue();
      done();
    });
  });

  it('deve criar uma nova folha com status ABERTA', (done) => {
    servico
      .criar({ nomeFuncionario: 'Teste', cargo: 'Dev', competencia: '2025-03' })
      .subscribe((nova) => {
        expect(nova.id).toBeDefined();
        expect(nova.status).toBe('ABERTA');
        expect(nova.itens.length).toBe(0);
        done();
      });
  });

  it('deve adicionar item e calcular total líquido corretamente', (done) => {
    servico
      .criar({ nomeFuncionario: 'X', cargo: 'Y', competencia: '2025-02' })
      .subscribe((folha) => {
        servico
          .adicionarItem(folha.id, { descricao: 'Salário', tipo: 'ENTRADA', valor: 1000 })
          .subscribe(() => {
            servico
              .adicionarItem(folha.id, { descricao: 'INSS', tipo: 'DESCONTO', valor: 100 })
              .subscribe(() => {
                servico.buscarPorId(folha.id).subscribe((atual) => {
                  expect(servico.calcularTotalEntradas(atual)).toBe(1000);
                  expect(servico.calcularTotalDescontos(atual)).toBe(100);
                  expect(servico.calcularTotalLiquido(atual)).toBe(900);
                  done();
                });
              });
          });
      });
  });

  it('não deve fechar folha sem itens (líquido zero)', (done) => {
    servico
      .criar({ nomeFuncionario: 'Zezinho', cargo: 'Aux', competencia: '2025-04' })
      .subscribe((folha) => {
        servico.fechar(folha.id).subscribe({
          next: () => fail('Deveria ter dado erro'),
          error: (e) => {
            expect(e.message).toContain('líquido');
            done();
          },
        });
      });
  });

  it('deve fechar e reabrir uma folha válida', (done) => {
    servico
      .criar({ nomeFuncionario: 'W', cargo: 'B', competencia: '2025-05' })
      .subscribe((folha) => {
        servico
          .adicionarItem(folha.id, { descricao: 'Salário', tipo: 'ENTRADA', valor: 2000 })
          .subscribe(() => {
            servico.fechar(folha.id).subscribe((f) => {
              expect(f.status).toBe('FECHADA');
              servico.reabrir(folha.id).subscribe((r) => {
                expect(r.status).toBe('ABERTA');
                done();
              });
            });
          });
      });
  });

  it('não deve permitir adicionar item em folha FECHADA', (done) => {
    servico
      .criar({ nomeFuncionario: 'Q', cargo: 'C', competencia: '2025-06' })
      .subscribe((folha) => {
        servico
          .adicionarItem(folha.id, { descricao: 'Salário', tipo: 'ENTRADA', valor: 500 })
          .subscribe(() => {
            servico.fechar(folha.id).subscribe(() => {
              servico
                .adicionarItem(folha.id, { descricao: 'Bônus', tipo: 'ENTRADA', valor: 100 })
                .subscribe({
                  next: () => fail('Deveria ter dado erro'),
                  error: (e) => {
                    expect(e.message).toContain('FECHADA');
                    done();
                  },
                });
            });
          });
      });
  });

  it('deve remover uma folha', (done) => {
    servico
      .criar({ nomeFuncionario: 'Rem', cargo: 'C', competencia: '2025-07' })
      .subscribe((folha) => {
        servico.remover(folha.id).subscribe(() => {
          servico.buscarPorId(folha.id).subscribe({
            next: () => fail('Deveria ter dado erro'),
            error: (e) => {
              expect(e.message).toContain('não encontrada');
              done();
            },
          });
        });
      });
  });
});