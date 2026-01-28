# CondoFlow

Production-grade condominium management platform for Portugal.

## Features

- 🏢 **Multi-Condominium Management**: Manage multiple condominiums from a single platform
- 💰 **Financial Tracking**: Track quotas, payments, debts, and fund reserves
- 🏠 **Fraction Management**: Manage owners, tenants, permillage, and payment status
- 🔧 **Occurrence Management**: Handle maintenance issues with priority/SLA tracking
- 📋 **Assembly Management**: Plan and document assemblies (AGMs) with convocatórias and minutes
- 📄 **Document Management**: Organize contracts, invoices, minutes, and certificates
- 👷 **Supplier & Project Management**: Manage suppliers, quotes, and construction projects
- 🔐 **Role-Based Access**: ADMIN, GESTOR, and COLABORADOR roles

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: TailwindCSS + shadcn/ui + Lucide icons
- **Routing**: React Router v6
- **State**: TanStack Query + Zustand
- **Forms**: React Hook Form + Zod
- **Tables**: TanStack Table
- **Charts**: Recharts
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite with Prisma ORM
- **Auth**: JWT with role-based access control
- **Testing**: Vitest + React Testing Library

## Project Structure

```
condoflow/
├── apps/
│   ├── web/               # React frontend
│   └── api/               # Express backend
├── packages/
│   └── shared/            # Shared types and schemas
├── package.json           # Root workspace config
└── README.md             # This file
```

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Database

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed database with dummy data
pnpm db:seed
```

The seed script creates:
- 8 condominiums
- 80 fractions (units)
- 40 occurrences
- 200+ ledger entries
- 15 suppliers
- 10 projects (obras)
- Assembly and document records

### 3. Run Development Servers

```bash
pnpm dev
```

This starts:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Demo Credentials

```
Admin:
- Email: admin@condoflow.pt
- Password: admin123

Gestor:
- Email: gestor@condoflow.pt
- Password: gestor123

Colaborador:
- Email: colaborador@condoflow.pt
- Password: colab123
```

## Available Scripts

### Development

- `pnpm dev` - Run both frontend and backend in dev mode
- `pnpm build` - Build all packages for production
- `pnpm test` - Run all tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm lint` - Lint all packages
- `pnpm format` - Format code with Prettier

### Database

- `pnpm db:generate` - Generate Prisma client
- `pnpm db:push` - Push schema changes to database
- `pnpm db:seed` - Seed database with dummy data
- `pnpm db:studio` - Open Prisma Studio (database GUI)

## Testing

### Run All Tests

```bash
pnpm test
```

### Frontend Tests

```bash
cd apps/web
pnpm test
```

Includes:
- Component rendering tests
- User interaction tests
- Form validation tests
- Routing tests

### Backend Tests

```bash
cd apps/api
pnpm test
```

Includes:
- Authentication tests
- API endpoint tests
- Data validation tests
- Authorization tests

## Manual QA Checklist

See [MANUAL_QA.md](./MANUAL_QA.md) for detailed testing procedures.

## Architecture

### Backend Structure

```
apps/api/
├── src/
│   ├── routes/           # API route handlers
│   ├── middleware/       # Auth, error handling
│   ├── services/         # Business logic
│   ├── utils/            # Utilities
│   ├── prisma/           # Database schema & seeds
│   └── index.ts          # App entry point
```

### Frontend Structure

```
apps/web/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Route pages
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities & API client
│   ├── store/            # Zustand stores
│   └── main.tsx          # App entry point
```

### Shared Package

```
packages/shared/
├── src/
│   ├── types/            # TypeScript types
│   └── schemas/          # Zod validation schemas
```

## Key Features

### Dashboard
- At-a-glance KPIs (balance, debts, open issues)
- Priority list for today's actions
- Risk assessment for condominiums
- Quick action buttons

### Condominium Management
- List view with search, filters, sorting
- Create/edit with validation
- Detailed view with tabs:
  - Overview with alerts
  - Fractions management
  - Financial tracking
  - Occurrences (issues)
  - Documents
  - Projects (obras)
  - Assemblies (AGMs)
  - Contacts

### Gestão Financeira Global
**Novo Módulo Avançado**:
- **Consola Transversal**: Histórico de todos os movimentos de todos os condomínios num único local.
- **Insights em Tempo Real**: Cards de resumo com Total de Receitas, Despesas e Saldo do período.
- **Filtragem Avançada**: Filtros por período, condomínio, tipo, categoria, estado (Normal/Anulado/Pendente) e método de pagamento.
- **Auditoria**: Tabela densa com sinalização discreta de tipo, entidade associada e referências.
- **Ações Rápidas**: Registar receitas/despesas, editar movimentos e anulação com reversão automática de saldo.
- **Exportação**: Geração de relatórios CSV para auditoria externa.
- **Drill-down**: Detalhe completo do movimento com contexto do condomínio, fração/fornecedor e documentos associados.

### Módulo de Fornecedores (Directório Profissional)
**Gestão Avançada de Prestadores de Serviços**:
- **Console Central**: Diretório completo com pesquisa inteligente por nome, NIF, email ou tags.
- **Categorização Inteligente**: Suporte a múltiplas categorias e tags para facilitar a localização de especialistas (Picheleiros, Eletricistas, etc.).
- **Perfil 360º**: Drawer de detalhe com visão completa:
  - **Overview**: KPIs de desempenho, notas internas e contactos.
  - **Histórico**: Lista de todas as ocorrências e assistências prestadas.
  - **Projetos**: Participação em obras e projetos de longo prazo.
  - **Financeiro**: Total faturado e lista de pagamentos realizados.
  - **Arquivo Digital**: Documentação do fornecedor (seguros, alvarás, contratos).
- **Favoritos & Status**: Sistema de marcação de "Favoritos" para parceiros VIP e gestão de estado (Ativo/Inativo).
- **Validação de NIF**: Proteção contra erros com validação de checksum de NIF português.
- **Exportação e Relatórios**: Exportação integral da base de dados para CSV.
- **Integração**: Ligação nativa com Ocorrências, Finanças e Projetos.
- Create with category, priority, SLA
- Kanban/list views
- Status workflow tracking
- Supplier assignment
- Audit trail

### Ocorrências Globais (Triagem Centralizada)
- **Lista Global** de todas as ocorrências de todos os condomínios, com filtros e paginação server-side.
- **Filtros avançados**: estado, prioridade, condomínio, fração, categoria, fornecedor (sim/não), datas (hoje/7/30 dias) e SLA/atrasadas.
- **Ordenação**: por prioridade, mais recentes, mais antigas e estado.
- **Ações rápidas na tabela**: ver detalhe, mudar estado, marcar/desmarcar urgente, atribuir fornecedor, arquivar e eliminar.
- **Detalhe completo em drawer**: visão geral, atividade/comentários, anexos (documentos) e relações (fornecedor, custos).
- **Criação/Edição** com validação: formulário completo com condomínio, fração, categoria, prioridade, localização, SLA, notas e fornecedor atribuído.

### Assembly Management
- Schedule assemblies
- Generate convocatórias (notices)
- Create minutes (atas)
- Track decisions and outcomes

## Design System

- **Layout**: Sidebar navigation + top header
- **Spacing**: 8px grid system
- **Typography**: Consistent hierarchy
- **Colors**: Semantic (primary, secondary, destructive, muted)
- **Components**: shadcn/ui for consistency
- **States**: Loading skeletons, empty states, error handling
- **Accessibility**: Keyboard navigation, ARIA labels, focus management

## Production Considerations

### Security
- JWT authentication with httpOnly cookies
- Role-based authorization
- Input validation on both client and server
- SQL injection protection via Prisma
- XSS protection

### Performance
- Table virtualization for large datasets
- Optimistic updates with TanStack Query
- Code splitting and lazy loading
- Image optimization
- Database indexing

### Data Integrity
- Zod schema validation
- Prisma type safety
- Transaction support for critical operations
- Consistent currency (EUR) and date (PT) formatting

## Future Enhancements

- PostgreSQL for production
- External authentication providers (OAuth)
- Real-time notifications (WebSockets)
- Email integration
- Mobile app (React Native)
- Multi-language support
- Advanced reporting and analytics
- Document versioning
- Integration with accounting software
- Automated payment processing

## License

Proprietary - All rights reserved

## Support

For issues or questions, contact: support@condoflow.pt
=======
# condo-flow
CondoFlow – SaaS platform for condominium management in Portugal. Dashboards, incidents, finances, assemblies, documents and suppliers built with React and TypeScript.
>>>>>>> 67d809383b802152f0fce0d36e5368eef25c49c6
