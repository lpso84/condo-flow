# Manual QA Checklist - CondoFlow

## Prerequisites
- Application running: `pnpm dev`
- Database seeded: `pnpm db:seed`
- Both frontend (localhost:5173) and backend (localhost:3001) servers running

## Test User Credentials

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

## Test Scenarios

### 1. Authentication Flow

**Test 1.1: Successful Login**
- [ ] Navigate to http://localhost:5173
- [ ] Enter admin credentials
- [ ] Click "Entrar"
- [ ] Verify redirect to dashboard
- [ ] Verify user name appears in header

**Test 1.2: Invalid Credentials**
- [ ] Logout if logged in
- [ ] Enter invalid email/password
- [ ] Click "Entrar"
- [ ] Verify error message appears
- [ ] Verify no redirect occurs

**Test 1.3: Logout**
- [ ] Login with any user
- [ ] Click user menu in top right
- [ ] Click "Sair"
- [ ] Verify redirect to login page
- [ ] Verify cannot access protected routes

### 2. Dashboard

**Test 2.1: KPI Display**
- [ ] Login as admin
- [ ] Verify "Saldo Global" shows monetary value
- [ ] Verify "Dívidas Totais" shows amount
- [ ] Verify "Ocorrências Abertas" shows count
- [ ] Verify "Urgências" shows count
- [ ] Verify "Assembleias Pendentes" shows count

**Test 2.2: Priority Items**
- [ ] Verify "Prioridades Hoje" section displays
- [ ] Verify at least 3-5 priority items show
- [ ] Verify each item shows: title, description, urgency level

**Test 2.3: At-Risk Condominiums**
- [ ] Verify "Condomínios em Risco" section displays
- [ ] Verify table shows: name, risk level, debt, urgent occurrences
- [ ] Verify risk levels are color-coded

**Test 2.4: Quick Actions**
- [ ] Verify quick action buttons are visible
- [ ] Click "Novo Condomínio" - should navigate to create form
- [ ] Click "Nova Ocorrência" - should open create modal

### 3. Condominium Management

**Test 3.1: List View**
- [ ] Navigate to "Condomínios" from sidebar
- [ ] Verify list of condominiums displays
- [ ] Verify columns: Nome, Morada, Cidade, Saldo, Dívida
- [ ] Verify pagination controls if > 20 items

**Test 3.2: Search**
- [ ] Enter condominium name in search box
- [ ] Verify list filters in real-time
- [ ] Clear search, verify all results return

**Test 3.3: Create Condominium**
- [ ] Click "Novo Condomínio" button
- [ ] Fill all required fields:
  - Nome: "Teste Condomínio"
  - Morada: "Rua Teste, 123"
  - Código Postal: "1234-567"
  - Cidade: "Lisboa"
  - NIF: "123456789"
  - Conta Bancária: "PT50 0002 0000 0000 0000 0001"
- [ ] Click "Criar"
- [ ] Verify success message
- [ ] Verify new condominium appears in list

**Test 3.4: View Condominium Detail**
- [ ] Click on any condominium from list
- [ ] Verify redirect to detail page
- [ ] Verify tabs: Visão Geral, Frações, Ocorrências, Finanças, Documentos, Obras, Assembleias, Contactos
- [ ] Verify header shows condominium name and KPIs

**Test 3.5: Edit Condominium**
- [ ] From detail page, click "Editar"
- [ ] Change "Cidade" field
- [ ] Click "Guardar"
- [ ] Verify success message
- [ ] Verify change is reflected

### 4. Fractions (Frações)

**Test 4.1: List Fractions**
- [ ] Navigate to condominium detail
- [ ] Click "Frações" tab
- [ ] Verify table shows: Fração, Andar, Permilagem, Proprietário, Quota Mensal, Estado
- [ ] Verify payment status badges (EM_DIA in green, ATRASO in red)

**Test 4.2: Create Fraction**
- [ ] Click "Nova Fração"
- [ ] Fill form:
  - Número: "101"
  - Andar: "1"
  - Permilagem: 50
  - Quota Mensal: 100
  - Nome Proprietário: "João Teste"
  - Email: "joao.teste@mail.pt"
  - Telefone: "912345678"
- [ ] Click "Criar"
- [ ] Verify fraction appears in list

**Test 4.3: View Fraction Detail**
- [ ] Click on any fraction
- [ ] Verify detail panel/modal opens
- [ ] Verify shows: owner info, payment history, debt amount
- [ ] Verify actions: Registar Pagamento, Editar

**Test 4.4: Register Payment**
- [ ] Find a fraction with debt (Estado: ATRASO)
- [ ] Click "Registar Pagamento"
- [ ] Fill payment form:
  - Montante: equal to or greater than debt
  - Método: Transferência
  - Data: today
- [ ] Submit
- [ ] Verify debt decreases or status changes to EM_DIA

### 5. Occurrences (Ocorrências)

**Test 5.1: List Occurrences**
- [ ] Navigate to condominium detail
- [ ] Click "Ocorrências" tab
- [ ] Verify occurrences displayed (list or kanban)
- [ ] Verify filters: status, priority, category

**Test 5.2: Filter by Priority**
- [ ] Select "URGENTE" from priority filter
- [ ] Verify only urgent occurrences show
- [ ] Verify count updates

**Test 5.3: Create Occurrence**
- [ ] Click "Nova Ocorrência"
- [ ] Fill form:
  - Título: "Teste Infiltração"
  - Descrição: "Infiltração no teto"
  - Categoria: INFILTRACAO
  - Prioridade: URGENTE
  - Localização: "Fração 101"
  - Reportado por: "João Silva"
  - SLA: 2 days from now
- [ ] Submit
- [ ] Verify occurrence appears with ABERTA status
- [ ] Verify urgency badge displayed

**Test 5.4: Update Occurrence Status**
- [ ] Click on occurrence
- [ ] Change status from ABERTA to EM_ANALISE
- [ ] Add note
- [ ] Save
- [ ] Verify status updated
- [ ] Verify note saved

**Test 5.5: Assign Supplier**
- [ ] Open occurrence detail
- [ ] Select supplier from dropdown
- [ ] Save
- [ ] Verify supplier assigned

**Test 5.6: Resolve Occurrence**
- [ ] Change status to RESOLVIDA
- [ ] Verify resolvedAt timestamp set
- [ ] Verify occurrence removed from "Open" count

### 6. Financial Management (Finanças)

**Test 6.1: View Transactions**
- [ ] Navigate to condominium detail
- [ ] Click "Finanças" tab
- [ ] Verify transaction list displays
- [ ] Verify columns: Data, Descrição, Categoria, Tipo, Montante

**Test 6.2: Filter by Type**
- [ ] Filter by "RECEITA"
- [ ] Verify only income transactions show (positive, green)
- [ ] Filter by "DESPESA"
- [ ] Verify only expense transactions show (negative, red)

**Test 6.3: Create Transaction (Income)**
- [ ] Click "Novo Movimento"
- [ ] Fill form:
  - Tipo: RECEITA
  - Categoria: QUOTA
  - Montante: 100
  - Descrição: "Pagamento quota"
  - Data: today
  - Fração: select any
  - Método: TRANSFERENCIA
- [ ] Submit
- [ ] Verify transaction appears
- [ ] Verify balance increases

**Test 6.4: Create Transaction (Expense)**
- [ ] Click "Novo Movimento"
- [ ] Fill form:
  - Tipo: DESPESA
  - Categoria: LIMPEZA
  - Montante: 50
  - Descrição: "Serviço limpeza"
  - Fornecedor: select one
- [ ] Submit
- [ ] Verify balance decreases

**Test 6.5: Export CSV**
- [ ] Click "Exportar CSV" button
- [ ] Verify CSV file downloads
- [ ] Open CSV, verify data format

### 7. Documents (Documentos)

**Test 7.1: List Documents**
- [ ] Navigate to condominium detail
- [ ] Click "Documentos" tab
- [ ] Verify documents displayed by category

**Test 7.2: Filter by Category**
- [ ] Select "ATAS" category
- [ ] Verify only minutes/atas display
- [ ] Select "FATURAS"
- [ ] Verify only invoices display

**Test 7.3: Upload Document (MVP stub)**
- [ ] Click "Carregar Documento"
- [ ] Fill form:
  - Título: "Teste Documento"
  - Categoria: CONTRATOS
  - Nome ficheiro: test.pdf
- [ ] Submit
- [ ] Verify document appears in list

**Test 7.4: Search Documents**
- [ ] Enter keyword in search
- [ ] Verify results filter by title/tags

### 8. Assemblies (Assembleias)

**Test 8.1: List Assemblies**
- [ ] Navigate to condominium detail
- [ ] Click "Assembleias" tab
- [ ] Verify assemblies list
- [ ] Verify status badges

**Test 8.2: Create Assembly**
- [ ] Click "Nova Assembleia"
- [ ] Fill form:
  - Data: future date
  - Local: "Salão do Condomínio"
  - Agenda: "1. Aprovação de contas\n2. Obras"
- [ ] Status should be AGENDADA
- [ ] Submit
- [ ] Verify assembly appears

**Test 8.3: Generate Convocatória (MVP stub)**
- [ ] Open assembly detail
- [ ] Click "Gerar Convocatória"
- [ ] Verify generates HTML/PDF placeholder

**Test 8.4: Record Minutes (Ata)**
- [ ] Open assembly detail
- [ ] Click "Registar Ata"
- [ ] Enter minutes text
- [ ] Save
- [ ] Change status to REALIZADA
- [ ] Verify minutes saved

### 9. Suppliers & Projects (Fornecedores & Obras)

**Test 9.1: List Suppliers**
- [ ] Navigate to "Fornecedores" from sidebar
- [ ] Verify supplier list displays
- [ ] Verify columns: Nome, NIF, Categorias, Contacto

**Test 9.2: Create Supplier**
- [ ] Click "Novo Fornecedor"
- [ ] Fill form:
  - Nome: "Teste Limpezas"
  - NIF: "987654321"
  - Email: "teste@limpezas.pt"
  - Categorias: "Limpeza"
- [ ] Submit
- [ ] Verify appears in list

**Test 9.3: View Projects (Obras)**
- [ ] Navigate to condominium detail
- [ ] Click "Obras" tab
- [ ] Verify projects list
- [ ] Verify status badges

**Test 9.4: Create Project**
- [ ] Click "Nova Obra"
- [ ] Fill form:
  - Título: "Pintura Fachada"
  - Descrição: "Renovação da pintura"
  - Orçamento: 5000
  - Status: PLANEAMENTO
- [ ] Submit
- [ ] Verify project appears

**Test 9.5: Update Project Status**
- [ ] Open project
- [ ] Change status from PLANEAMENTO to EM_APROVACAO
- [ ] Assign supplier
- [ ] Save
- [ ] Verify updates reflected

### 10. Responsiveness & UX

**Test 10.1: Mobile Layout**
- [ ] Resize browser to mobile width (< 768px)
- [ ] Verify sidebar collapses to hamburger menu
- [ ] Verify tables become scrollable or stacked
- [ ] Verify forms remain usable

**Test 10.2: Loading States**
- [ ] Navigate to a new page
- [ ] Verify skeleton loaders appear during data fetch
- [ ] Verify smooth transition to actual content

**Test 10.3: Empty States**
- [ ] Create a new condominium with no fractions
- [ ] Navigate to Frações tab
- [ ] Verify friendly empty state with CTA
- [ ] Repeat for other tabs

**Test 10.4: Error Handling**
- [ ] Stop API server
- [ ] Try to load a page
- [ ] Verify error message displays
- [ ] Verify retry option available
- [ ] Restart API server
- [ ] Verify recovery

**Test 10.5: Toast Notifications**
- [ ] Perform create/update/delete operations
- [ ] Verify success toasts appear
- [ ] Cause validation errors
- [ ] Verify error toasts appear
- [ ] Verify toasts auto-dismiss

### 11. Role-Based Access

**Test 11.1: Admin Access**
- [ ] Login as admin
- [ ] Verify can access all sections
- [ ] Verify can create/edit/delete all entities

**Test 11.2: Gestor Access**
- [ ] Login as gestor
- [ ] Verify can access most sections
- [ ] Verify appropriate permissions

**Test 11.3: Colaborador Access**
- [ ] Login as colaborador
- [ ] Verify limited access
- [ ] Verify cannot delete condominiums

### 12. Performance

**Test 12.1: Table Performance**
- [ ] Navigate to transaction list with 200+ items
- [ ] Verify smooth scrolling
- [ ] Verify pagination works smoothly
- [ ] Change page size to 50
- [ ] Verify loads quickly

**Test 12.2: Search Performance**
- [ ] Type rapidly in search boxes
- [ ] Verify debounced, doesn't lag
- [ ] Verify results accurate

## Bug Reporting Template

```
Title: [Brief description]
Steps to Reproduce:
1.
2.
3.

Expected Result:
[What should happen]

Actual Result:
[What actually happens]

Environment:
- Browser:
- OS:
- User Role:

Screenshot/Video:
[If applicable]
```

## Sign-off

- [ ] All critical path tests passed
- [ ] No blocking bugs found
- [ ] Performance acceptable
- [ ] UX/UI consistent across pages
- [ ] Ready for deployment

**Tester Name:** _________________
**Date:** _________________
**Signature:** _________________
