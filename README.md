# OficinaPro • Sistema de Gestão de Oficina Mecânica (Carros & Motos)

Aplicação web completa, moderna e profissional desenvolvida com **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **PostgreSQL** e **Prisma ORM** para gestão de oficinas especializadas em **Carros** e **Motos**.

---

## 🚀 Funcionalidades Principais

### 1. 🔐 Autenticação & Segurança
- Sistema de login seguro com sessões baseadas em JWT assinadas e armazenadas em cookies `HttpOnly` com `SameSite=Lax`.
- Hash de senhas com `bcryptjs`.
- Proteção global de rotas via middleware do Next.js.
- Níveis de usuário preparados: `ADMIN` (Gerente), `MECANICO` (Mecânico Chefe) e `ATENDENTE` (Recepção).
- Botões de preenchimento rápido na tela de login para facilitar demonstração e testes.

### 2. 📊 Dashboard Executivo
- **Cards de Métricas em Tempo Real:**
  - Total de clientes cadastrados;
  - Total de veículos na frota;
  - Divisão instantânea entre **Carros** e **Motos**;
  - Orçamentos em aberto e orçamentos aprovados;
  - Faturamento acumulado e valor total de propostas comerciais.
- **Gráficos com Recharts:**
  - Gráfico Donut de distribuição da frota atendida (Carros vs. Motos);
  - Gráfico de barras com o fluxo e volume financeiro por status de orçamento.
- **Tabela de Manutenções Recentes:**
  - Últimos serviços registrados com placa, veículo, cliente, data, odômetro, mecânico e valor total.
- **Atalhos Rápidos:**
  - Botões "+ Cliente", "+ Veículo" e "+ Orçamento".

### 3. 👥 Módulo de Clientes
- **CRUD Completo:** Listagem, cadastro, edição e exclusão.
- **Pesquisa Instantânea:** Filtro em tempo real por Nome, CPF ou Telefone.
- **Validações e Máscaras:** Validação rigorosa com Zod para CPF (11 dígitos), telefone com DDD e e-mail.
- **Prontuário 360° do Cliente:**
  - Cartão com dados de contato e endereço completo;
  - Grid de veículos pertencentes ao cliente com badges de Carro/Moto e atalhos rápidos;
  - **Histórico Consolidado:** Linha do tempo unificada de todos os serviços já realizados em qualquer veículo do cliente;
  - Orçamentos vinculados com status em tempo real.
- **Segurança de Exclusão:** Bloqueio inteligente de exclusão para clientes que possuem registros de serviços para proteger histórico de garantia.

### 4. 🚗 Módulo de Veículos (Carros e Motos)
- **Suporte Multimarcas:** Especializado em **CARROS** e **MOTOS**.
- **Filtros por Categoria:** Abas de filtro rápido para "Todos", "Carros" e "Motos".
- **Busca:** Pesquisa por Placa, Modelo ou Proprietário.
- **Cadastro e Edição Completa:**
  - Seleção visual do tipo de veículo (Carro ou Moto);
  - Associação com o cliente proprietário em seletor com busca;
  - Marca, Modelo, Ano de Fabricação/Modelo;
  - Placa veicular única no formato Mercosul ou padrão antigo;
  - Odômetro atual (Quilometragem);
  - Cor, Chassi/VIN e Observações gerais.
- **Prontuário do Veículo:**
  - Placa destacada em formato visual oficial Mercosul;
  - Cartão do proprietário com acesso direto ao perfil do cliente;
  - Indicadores de odômetro e quantidade de manutenções registradas.

### 5. 🛠️ Histórico Permanente e Linha do Tempo (Timeline)
- **Linha do Tempo Visual e Cronológica:**
  - Exibição elegante em formato de timeline vertical com conectores e pontos luminosos;
  - Data da realização e quilometragem no momento do atendimento;
  - Queixa ou problema relatado pelo cliente;
  - Diagnóstico técnico realizado pelo profissional;
  - Mão de obra e serviços efetuados;
  - Peças e insumos substituídos;
  - Mecânico ou técnico responsável;
  - Valor total cobrado pelo serviço.
- **Atualização Inteligente do Odômetro:**
  - Ao registrar um novo serviço ou orçamento, se a quilometragem informada for superior à cadastrada no veículo, o odômetro do veículo é atualizado automaticamente.
- **Permanência dos Dados:** Histórico vinculado permanentemente ao veículo.

### 6. 📄 Módulo de Orçamentos
- **Criador Dinâmico de Propostas Comerciais:**
  - Seleção em cascata: ao selecionar o cliente, os veículos disponíveis daquele cliente são carregados automaticamente;
  - Datas de emissão e validade da proposta;
  - Status inicial (`Rascunho`, `Enviado`, `Aprovado`, `Recusado`, `Expirado`);
  - **Tabela Dinâmica de Itens:** Adição e remoção rápida de linhas com especificação de tipo (`Serviço` ou `Peça`), descrição, quantidade, valor unitário e desconto por item;
  - **Cálculo Automático:** Subtotal por item, somatório de mão de obra, somatório de peças, desconto global e valor total calculado em tempo real.
- **Visualização Fatura / Impressão:**
  - Layout pronto para impressão (`Ctrl+P` ou botão direto "Imprimir / PDF");
  - Cabeçalho formal da oficina com logotipo e dados cadastrais;
  - Discriminação detalhada de serviços, peças, descontos e total;
  - Campo de assinaturas do cliente e do responsável técnico.
- **Workflow de Aprovação e Preparação para O.S.:**
  - Botões para transição de status em 1 clique ("Marcar como Enviado", "Aprovar Orçamento", "Recusar");
  - Ao ser aprovado, o sistema destaca visualmente que o orçamento está pronto para geração de **Ordem de Serviço (O.S.)**;
  - O banco de dados já possui o campo `workOrderId` reservado para evolução contínua.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend & Backend:** Next.js 16 (App Router) + React 19
- **Linguagem:** TypeScript 5
- **Estilização:** Tailwind CSS v4 com identidade visual moderna para oficinas mecânicas (paleta slate/grafite com acentos azul, esmeralda e âmbar)
- **Banco de Dados:** PostgreSQL
- **ORM:** Prisma ORM 6.4
- **Validações:** Zod
- **Gráficos:** Recharts
- **Ícones:** Lucide React
- **Notificações:** Sonner (Toasts modernos)
- **Criptografia & Sessão:** `bcryptjs` e `jose` (JWT)

---

## 📦 Como Executar a Aplicação Localmente

### 1. Pré-requisitos
- **Node.js:** versão 18 ou superior (testado com Node.js v22)
- **PostgreSQL:** em execução local na porta `5432`

### 2. Configurar Variáveis de Ambiente
O arquivo `.env` já está configurado na raiz:
```env
DATABASE_URL="postgresql://postgres@localhost:5432/oficina_db?schema=public"
JWT_SECRET="oficina-mecanica-super-secret-jwt-token-key-2026-prod"
NEXT_PUBLIC_APP_NAME="OficinaPro"
```

### 3. Sincronizar o Banco e Executar os Seeds de Teste
Para sincronizar as tabelas com o PostgreSQL e popular com carros, motos, clientes e históricos realistas:
```bash
# Sincronizar tabelas no banco de dados
npx prisma db push

# Executar o seed com dados de teste
npx prisma db seed
```

### 4. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse no navegador: **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Credenciais de Demonstração

Para testar todos os módulos, você pode utilizar os botões de 1 clique na tela de login ou inserir manualmente:

| Perfil | E-mail | Senha | Função |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@oficinapro.com` | `admin123` | Gerente da Oficina |
| **Mecânico** | `marcos@oficinapro.com` | `mecanico123` | Mecânico Chefe |
| **Atendente** | `juliana@oficinapro.com` | `atendente123` | Recepção / Atendimento |

---

## 🏛️ Estrutura do Projeto

```
src/
├── app/
│   ├── api/auth/             # Rotas de login, logout e sessão
│   ├── actions/              # Server Actions tipadas (clients, vehicles, budgets, history)
│   ├── clientes/             # Módulo de clientes (listagem, cadastro, edição, prontuário 360°)
│   ├── veiculos/             # Módulo de carros e motos (listagem, prontuário e timeline)
│   ├── orcamentos/           # Módulo de orçamentos (criador dinâmico, fatura e workflow)
│   ├── login/                # Página de login com credenciais de teste
│   ├── page.tsx              # Dashboard executivo com métricas e gráficos
│   └── layout.tsx            # Root layout com Sonner toaster
├── components/
│   ├── layout/AppShell.tsx   # Sidebar responsiva com drawer mobile e cabeçalho
│   ├── dashboard/            # Gráficos com Recharts (frota e orçamentos)
│   ├── clients/              # Formulários e listagens de clientes
│   ├── vehicles/             # Prontuário, formulários e timeline de serviços
│   └── budgets/              # Criador de orçamento e fatura para impressão
├── lib/
│   ├── prisma.ts             # Instância do Prisma Client
│   ├── auth.ts               # Autenticação segura com JWT e cookies HttpOnly
│   ├── utils.ts              # Formatadores (Moeda BRL, placas, CPF, telefone, Km)
│   └── validations/          # Schemas Zod de validação
└── prisma/
    ├── schema.prisma         # Modelagem completa do banco de dados
    └── seed.ts               # Seed com dados ricos do ecossistema automotivo brasileiro
```
