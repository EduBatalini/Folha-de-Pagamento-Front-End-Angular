# Folha de Pagamento

Projeto desenvolvido em Angular 18 utilizando Standalone Components para gerenciamento de folhas de pagamento.

A aplicação permite cadastrar folhas, adicionar ganhos e descontos, calcular automaticamente o valor líquido e controlar o status da folha (aberta ou fechada).

Os dados são mantidos apenas em memória, sem integração com banco de dados ou API. Para simular operações assíncronas foi utilizado RxJS com delay.

# Funcionalidades

Cadastro de folhas de pagamento
Edição e exclusão de folhas
Fechamento e reabertura de folhas
Cadastro de entradas e descontos
Cálculo automático do valor líquido
Filtro por status das folhas
Validações de formulário
Feedback visual através de snackbars

# Tecnologias utilizadas

Angular 18
TypeScript
Angular Material
RxJS
Signals
Jasmine e Karma para testes

# Executando o projeto

Requisitos:

Node.js 18 ou superior
npm 9 ou superior

Acesse a pasta do projeto:

cd Folha-de-Pagamento-Front-End-Angular-main
cd .\folha\


Instale as dependências:

npm install


Execute a aplicação:

npm start


A aplicação ficará disponível em:

http://localhost:4200


Outros comandos úteis:

# Gerar build de produção
npm run build

# Executar testes unitários
npm test


## Estrutura

src/app
├── componentes
│   ├── dialogo-confirmacao
│   ├── formulario-folha
│   └── formulario-item
├── modelos
├── paginas
│   ├── detalhes-folha
│   └── lista-folhas
├── servicos
└── validadores


### Organização

componentes: componentes reutilizáveis e diálogos da aplicação.
modelos: interfaces e tipos utilizados no projeto.
paginas: telas principais da aplicação.
servicos: regras de negócio, gerenciamento de estado e operações da folha de pagamento.
validadores: validadores customizados utilizados nos formulários.

## Testes

Os testes unitários foram implementados para validar as principais regras de negócio da aplicação, incluindo:

Operações de CRUD das folhas de pagamento
Fechamento e reabertura de folhas
Cálculo dos valores totais
Validação das regras de negócio
Validadores customizados dos formulários

Para executar os testes:

npm test


## Regras de negócio

Toda folha é criada com status ABERTA.
Uma folha só pode ser fechada quando o valor líquido for maior que zero.
Folhas fechadas não podem ser alteradas.
Para editar uma folha fechada é necessário reabri-la.
A competência deve seguir o formato AAAA-MM.

