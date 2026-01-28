import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper to generate random date within range
function randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper to get random item from array
function randomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
    console.log('🌱 Starting seed...');

    // Clear existing data
    await prisma.auditLog.deleteMany();
    await prisma.occurrenceCategory.deleteMany();
    await prisma.workflowState.deleteMany();
    await prisma.documentType.deleteMany();
    await prisma.supplierCategory.deleteMany();
    await prisma.globalSettings.deleteMany();
    await prisma.userCondominium.deleteMany();

    await prisma.document.deleteMany();
    await prisma.assembly.deleteMany();
    await prisma.project.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.occurrence.deleteMany();
    await prisma.fraction.deleteMany();
    await prisma.supplier.deleteMany();
    await prisma.condominium.deleteMany();
    await prisma.user.deleteMany();

    console.log('✅ Cleared existing data');

    // --- SEED SYSTEM SETTINGS & LISTS ---

    // 1. Global Settings
    await prisma.globalSettings.upsert({
        where: { id: "global" },
        update: {},
        create: {
            id: "global",
            companyName: "CondoFlow Management",
            defaultReserveFundPercentage: 10,
            defaultIvaPercentage: 23,
            currency: "EUR",
            notifyOnOccurrence: true,
            notifyOnPaymentDelay: true,
            notifyOnAssembly: true
        }
    });

    // 2. Occurrence Categories
    const occCategories = [
        { name: "INFILTRACAO", slaHours: 24, priority: "URGENTE" },
        { name: "ELEVADOR", slaHours: 4, priority: "URGENTE" },
        { name: "LIMPEZA", slaHours: 48, priority: "NORMAL" },
        { name: "ELETRICIDADE", slaHours: 12, priority: "URGENTE" },
        { name: "CANALIZACAO", slaHours: 24, priority: "URGENTE" },
        { name: "AQUECIMENTO", slaHours: 48, priority: "NORMAL" },
        { name: "SEGURANCA", slaHours: 2, priority: "URGENTE" },
        { name: "OUTRO", slaHours: 72, priority: "NORMAL" }
    ];

    for (const cat of occCategories) {
        await prisma.occurrenceCategory.create({ data: cat });
    }

    // 3. Workflow States
    const wfStates = [
        { code: "ABERTA", label: "Aberta", order: 1, isInitial: true },
        { code: "EM_ANALISE", label: "Em Análise", order: 2 },
        { code: "EM_EXECUCAO", label: "Em Execução", order: 3 },
        { code: "AGUARDA_PECA", label: "Aguarda Peça/Terceiro", order: 4 },
        { code: "RESOLVIDA", label: "Resolvida", order: 5, isFinal: true },
        { code: "ARQUIVADA", label: "Arquivada", order: 6, isFinal: true }
    ];

    for (const wf of wfStates) {
        await prisma.workflowState.create({ data: wf });
    }

    // 4. Document Types
    const docTypes = ["ATA", "CONTRATO", "FATURA", "SEGURO", "ORCAMENTO", "RELATORIO", "OUTROS"];
    for (const dt of docTypes) {
        await prisma.documentType.create({ data: { name: dt, isSystem: true } });
    }

    // 5. Supplier Categories
    const suppCategories = ["LIMPEZA", "ELEVADOR", "ELETRICIDADE", "CANALIZACAO", "CONSTRUCAO", "JARDINAGEM", "SEGURANCA", "PINTURA", "CLIMATIZACAO", "VIDRARIA", "CARPINTARIA", "TECNOLOGIA", "SEGUROS", "OUTROS"];
    for (const sc of suppCategories) {
        await prisma.supplierCategory.create({ data: { name: sc } });
    }

    console.log('✅ Created system settings and categories');

    // Create Users
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const hashedPasswordGestor = await bcrypt.hash('gestor123', 10);
    const hashedPasswordColab = await bcrypt.hash('colab123', 10);

    const users = await Promise.all([
        prisma.user.create({
            data: {
                email: 'admin@condoflow.pt',
                password: hashedPassword,
                name: 'Administrator',
                role: 'ADMIN',
            },
        }),
        prisma.user.create({
            data: {
                email: 'gestor@condoflow.pt',
                password: hashedPasswordGestor,
                name: 'João Silva',
                role: 'GESTOR',
            },
        }),
        prisma.user.create({
            data: {
                email: 'colaborador@condoflow.pt',
                password: hashedPasswordColab,
                name: 'Maria Santos',
                role: 'COLABORADOR',
            },
        }),
    ]);

    console.log('✅ Created users');

    // Create Suppliers
    const suppliers = await Promise.all([
        prisma.supplier.create({
            data: {
                name: 'Limpezas Total Lda',
                nif: '501234560', // Adjusted for checksum if needed
                email: 'geral@limpezastotal.pt',
                phone: '212345678',
                address: 'Rua da Limpeza, 10, Lisboa',
                categories: 'LIMPEZA',
                contactPerson: 'António Silva',
                tags: 'limpeza, condomínio, mensal',
                favorite: true,
                active: true,
                notes: 'Fornecedor de confiança há 5 anos.'
            },
        }),
        prisma.supplier.create({
            data: {
                name: 'Elevadores Seguros SA',
                nif: '502345679',
                email: 'manutencao@elevseguros.pt',
                phone: '223456789',
                address: 'Av. dos Elevadores, 50, Porto',
                categories: 'ELEVADOR,MANUTENCAO',
                contactPerson: 'Carla Pereira',
                tags: 'elevadores, manutenção, 24h',
                favorite: false,
                active: true,
            },
        }),
        prisma.supplier.create({
            data: {
                name: 'Eletricidade Rápida',
                nif: '503456781',
                email: 'servico@eletricidaderapida.pt',
                phone: '214567890',
                address: 'Rua Elétrica, 25, Lisboa',
                categories: 'ELETRICIDADE',
                contactPerson: 'José Carlos',
                tags: 'urgente, eletricidade, lisboa',
                favorite: true,
                active: true,
            },
        }),
        prisma.supplier.create({
            data: {
                name: 'Canalização 24h',
                nif: '504567893',
                email: 'urgencias@canalizacao24h.pt',
                phone: '915678901',
                address: 'Praceta das Águas, 5, Cascais',
                categories: 'CANALIZACAO',
                contactPerson: 'Ricardo Veloso',
                tags: 'água, canalização, urgente',
                favorite: false,
                active: true,
            },
        }),
        prisma.supplier.create({
            data: {
                name: 'Obras & Construções Silva',
                nif: '505678901',
                email: 'obras@silvaconstroi.pt',
                phone: '21 678 9012',
                address: 'Estrada das Obras, 100, Sintra',
                categories: 'Construção,Manutenção',
            },
        }),
        prisma.supplier.create({
            data: {
                name: 'Seguros Condomínio Plus',
                nif: '506789012',
                email: 'contratos@seguroplus.pt',
                phone: '21 789 0123',
                address: 'Av. da República, 200, Lisboa',
                categories: 'Seguros',
            },
        }),
        prisma.supplier.create({
            data: {
                name: 'Jardinagem Verde',
                nif: '507890123',
                email: 'jardins@verde.pt',
                phone: '21 890 1234',
                address: 'Rua das Flores, 30, Oeiras',
                categories: 'Jardinagem',
            },
        }),
        prisma.supplier.create({
            data: {
                name: 'Segurança Total',
                nif: '508901234',
                email: 'vigilancia@seguratotal.pt',
                phone: '21 901 2345',
                address: 'Largo da Segurança, 1, Lisboa',
                categories: 'Segurança',
            },
        }),
        prisma.supplier.create({
            data: {
                name: 'Pinturas Modernas',
                nif: '509012345',
                email: 'orcamentos@pinturasmodernas.pt',
                phone: '22 012 3456',
                address: 'Rua das Tintas, 15, Porto',
                categories: 'Pintura,Manutenção',
            },
        }),
        prisma.supplier.create({
            data: {
                name: 'Climatização Conforto',
                nif: '510123456',
                email: 'instalacao@climaconforto.pt',
                phone: '21 123 4567',
                address: 'Av. do Ar Condicionado, 40, Almada',
                categories: 'Aquecimento,Ar Condicionado',
            },
        }),
        prisma.supplier.create({
            data: {
                name: 'Vidreira Central',
                nif: '511234567',
                email: 'vidros@vidraria.pt',
                phone: '21 234 5679',
                address: 'Rua do Vidro, 8, Lisboa',
                categories: 'Vidros,Manutenção',
            },
        }),
        prisma.supplier.create({
            data: {
                name: 'Carpintaria Artesanal',
                nif: '512345678',
                email: 'madeiras@carpintaria.pt',
                phone: '21 345 6780',
                address: 'Travessa da Madeira, 12, Setúbal',
                categories: 'Carpintaria',
            },
        }),
        prisma.supplier.create({
            data: {
                name: 'Desentupimentos Express',
                nif: '513456789',
                email: 'sos@desentope.pt',
                phone: '96 456 7891',
                address: 'Rua dos Esgotos, 3, Lisboa',
                categories: 'Canalização',
            },
        }),
        prisma.supplier.create({
            data: {
                name: 'Isolamentos Térmicos Pro',
                nif: '514567890',
                email: 'isolamento@thermopro.pt',
                phone: '21 567 8902',
                address: 'Av. do Isolamento, 22, Amadora',
                categories: 'Isolamento,Construção',
            },
        }),
        prisma.supplier.create({
            data: {
                name: 'Portaria Virtual 24h',
                nif: '515678901',
                email: 'suporte@portariavirtual.pt',
                phone: '21 678 9013',
                address: 'Rua Digital, 5, Lisboa',
                categories: 'Segurança,Tecnologia',
            },
        }),
    ]);

    console.log('✅ Created suppliers');

    // Portuguese condominium data
    const condominiumsData = [
        {
            name: 'Condomínio Quinta das Flores',
            address: 'Rua das Camélias, 45',
            postalCode: '1600-100',
            city: 'Lisboa',
            nif: '500100100',
            fractions: 12,
        },
        {
            name: 'Edifício Horizonte',
            address: 'Avenida da Liberdade, 120',
            postalCode: '1250-146',
            city: 'Lisboa',
            nif: '500200200',
            fractions: 8,
        },
        {
            name: 'Residencial Parque Verde',
            address: 'Rua do Parque, 23',
            postalCode: '2750-300',
            city: 'Cascais',
            nif: '500300300',
            fractions: 15,
        },
        {
            name: 'Condomínio Sol Nascente',
            address: 'Praceta do Sol, 10',
            postalCode: '4200-400',
            city: 'Porto',
            nif: '500400400',
            fractions: 10,
        },
        {
            name: 'Edifício Atlântico',
            address: 'Avenida do Mar, 55',
            postalCode: '9000-500',
            city: 'Funchal',
            nif: '500500500',
            fractions: 6,
        },
        {
            name: 'Condomínio Vista Linda',
            address: 'Rua da Vista, 78',
            postalCode: '2770-600',
            city: 'Oeiras',
            nif: '500600600',
            fractions: 9,
        },
        {
            name: 'Residencial Quinta do Lago',
            address: 'Estrada do Lago, 200',
            postalCode: '2710-700',
            city: 'Sintra',
            nif: '500700700',
            fractions: 12,
        },
        {
            name: 'Edifício Torres Gémeas',
            address: 'Praça Central, 1',
            postalCode: '2800-800',
            city: 'Almada',
            nif: '500800800',
            fractions: 8,
        },
    ];

    // Portuguese names for owners and tenants
    const portugueseNames = [
        'João Silva',
        'Maria Santos',
        'António Oliveira',
        'Ana Costa',
        'Manuel Ferreira',
        'Sofia Rodrigues',
        'Carlos Pereira',
        'Isabel Martins',
        'José Alves',
        'Teresa Gomes',
        'Paulo Ribeiro',
        'Margarida Fernandes',
        'Francisco Dias',
        'Rita Carvalho',
        'Pedro Sousa',
        'Catarina Mendes',
        'Miguel Lopes',
        'Beatriz Correia',
        'Rui Teixeira',
        'Inês Gonçalves',
        'Nuno Pinto',
        'Joana Marques',
        'Luís Reis',
        'Cristina Moreira',
        'André Nunes',
        'Sara Vieira',
        'Vitor Machado',
        'Patrícia Soares',
        'Hugo Castro',
        'Daniela Cardoso',
        'Tiago Monteiro',
        'Vera Pires',
        'Ricardo Fonseca',
        'Susana Lourenço',
        'Bruno Henriques',
        'Carla Baptista',
        'Diogo Almeida',
        'Liliana Tavares',
        'Fernando Cunha',
        'Mónica Ramos',
        'Gonçalo Freitas',
        'Andreia Simões',
        'Sérgio Rocha',
        'Paula Matos',
        'Jorge Barbosa',
        'Filipa Antunes',
        'Armando Moura',
        'Helena Faria',
        'Eduardo Cruz',
        'Sandra Barros',
        'Alberto Campos',
        'Cláudia Lima',
        'Marco Silva',
        'Raquel Duarte',
        'Vítor Nogueira',
        'Cristina Coelho',
        'Nelson Peixoto',
        'Lígia Morais',
        'Joaquim Leite',
        'Alexandra Neves',
        'Artur Guerreiro',
        'Sónia Domingues',
        'Fernando Branco',
        'Elisabete Esteves',
        'David Azevedo',
        'Anabela Macedo',
        'Renato Xavier',
        'Célia Magalhães',
        'Mário Vicente',
        'Fátima Vargas',
        'Hélder Pacheco',
        'Graça Amaral',
        'Luísa Miranda',
        'Roberto Araújo',
        'Sílvia Caetano',
        'Orlando Valente',
        'Madalena Silva',
        'Rodrigo Figueiredo',
        'Fernanda Melo',
        'Américo Brito',
    ];

    let nameIndex = 0;

    // Create Condominiums and Fractions
    for (const condoData of condominiumsData) {
        const fractionsForCondo = condoData.fractions;

        // Calculate condominium stats
        const totalPermillage = 1000;
        const baseQuota = 80 + Math.random() * 120; // 80-200 EUR base

        const condominium = await prisma.condominium.create({
            data: {
                name: condoData.name,
                address: condoData.address,
                postalCode: condoData.postalCode,
                city: condoData.city,
                nif: condoData.nif,
                bankAccount: `PT50 0002 0123 ${Math.floor(Math.random() * 10000000000)
                    .toString()
                    .padStart(11, '0')} 75`,
                balance: 5000 + Math.random() * 20000,
                debtTotal: Math.random() * 5000,
                reserveFund: 10000 + Math.random() * 30000,
                fractionsCount: fractionsForCondo,
            },
        });

        // Create fractions
        const fractions = [];
        for (let i = 0; i < fractionsForCondo; i++) {
            const floor = Math.floor(i / 2).toString();
            const permillage = Math.floor(totalPermillage / fractionsForCondo);
            const monthlyQuota = Math.round((baseQuota * permillage) / 100);
            const hasDebt = Math.random() > 0.7;
            const ownerName = portugueseNames[nameIndex % portugueseNames.length];
            nameIndex++;

            const hasTenant = Math.random() > 0.6;
            const tenantName = hasTenant
                ? portugueseNames[nameIndex % portugueseNames.length]
                : null;
            if (hasTenant) nameIndex++;

            const fraction = await prisma.fraction.create({
                data: {
                    condominiumId: condominium.id,
                    number: `${String.fromCharCode(65 + (i % 2))}`,
                    floor: floor,
                    permillage: permillage,
                    monthlyQuota: monthlyQuota,
                    ownerName: ownerName,
                    ownerEmail: `${ownerName.toLowerCase().replace(/ /g, '.')}@mail.pt`,
                    ownerPhone: `9${Math.floor(10000000 + Math.random() * 90000000)}`,
                    tenantName: tenantName,
                    tenantEmail: tenantName
                        ? `${tenantName.toLowerCase().replace(/ /g, '.')}@mail.pt`
                        : null,
                    tenantPhone: tenantName ? `9${Math.floor(10000000 + Math.random() * 90000000)}` : null,
                    paymentStatus: hasDebt ? (monthlyQuota * 3 < monthlyQuota * (1 + Math.floor(Math.random() * 3)) ? 'CRITICO' : 'ATRASO') : 'EM_DIA',
                    debtAmount: hasDebt ? monthlyQuota * (1 + Math.floor(Math.random() * 3)) : 0,
                    typology: randomItem(['T1', 'T2', 'T3', 'T4']),
                    occupation: randomItem(['PROPRIETARIO', 'ARRENDADA', 'DESCONHECIDO']),
                    isActive: true,
                    isFollowUp: Math.random() > 0.9,
                },
            });

            fractions.push(fraction);
        }

        console.log(`✅ Created condominium: ${condoData.name} with ${fractionsForCondo} fractions`);

        // Create transactions for each fraction
        const now = new Date();
        const startDate = new Date(now.getFullYear(), 0, 1);

        for (const fraction of fractions) {
            // Create monthly quota payments (some months might be missing)
            for (let month = 0; month < 12; month++) {
                if (Math.random() > 0.2) {
                    // 80% payment rate
                    const transactionDate = new Date(now.getFullYear(), month, Math.floor(5 + Math.random() * 10));

                    await prisma.transaction.create({
                        data: {
                            condominiumId: condominium.id,
                            fractionId: fraction.id,
                            type: 'RECEITA',
                            category: 'QUOTA',
                            amount: fraction.monthlyQuota,
                            description: `Quota mensal - ${fraction.number} - ${month + 1}/${now.getFullYear()}`,
                            date: transactionDate,
                            paymentMethod: randomItem(['TRANSFERENCIA', 'MULTIBANCO', 'DEBITO_DIRETO']),
                            reference: `REF${Math.floor(100000 + Math.random() * 900000)}`,
                        },
                    });
                }
            }
        }

        // Create condominium expense transactions
        const expenseCategories = [
            { category: 'LIMPEZA', supplier: suppliers[0] },
            { category: 'ELEVADOR', supplier: suppliers[1] },
            { category: 'ELETRICIDADE', supplier: suppliers[2] },
            { category: 'AGUA', supplier: null },
            { category: 'SEGURO', supplier: suppliers[5] },
            { category: 'MANUTENCAO', supplier: suppliers[4] },
        ];

        for (let i = 0; i < 30; i++) {
            const expense = randomItem(expenseCategories);
            await prisma.transaction.create({
                data: {
                    condominiumId: condominium.id,
                    supplierId: expense.supplier?.id,
                    type: 'DESPESA',
                    category: expense.category,
                    amount: 100 + Math.random() * 900,
                    description: `Despesa de ${expense.category.toLowerCase()} - ${condominium.name}`,
                    date: randomDate(startDate, now),
                    paymentMethod: randomItem(['TRANSFERENCIA', 'MULTIBANCO']),
                    reference: `FAT${Math.floor(1000 + Math.random() * 9000)}`,
                },
            });
        }

        // Create occurrences
        const occurrenceCategories = [
            'INFILTRACAO',
            'ELEVADOR',
            'LIMPEZA',
            'ELETRICIDADE',
            'CANALIZACAO',
            'AQUECIMENTO',
            'SEGURANCA',
        ];

        const numOccurrences = 3 + Math.floor(Math.random() * 5);

        for (let i = 0; i < numOccurrences; i++) {
            const category = randomItem(occurrenceCategories);
            const isUrgent = Math.random() > 0.7;
            const isResolved = Math.random() > 0.4;
            const reportedDate = randomDate(new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), now);

            const statuses = isResolved
                ? ['RESOLVIDA', 'ARQUIVADA']
                : ['ABERTA', 'EM_ANALISE', 'EM_EXECUCAO'];

            const slaDeadline = isUrgent
                ? new Date(reportedDate.getTime() + 2 * 24 * 60 * 60 * 1000)
                : new Date(reportedDate.getTime() + 7 * 24 * 60 * 60 * 1000);

            await prisma.occurrence.create({
                data: {
                    condominiumId: condominium.id,
                    fractionId: Math.random() > 0.5 ? randomItem(fractions).id : null,
                    title: `${category} - ${condominium.name}`,
                    description: `Ocorrência de ${category.toLowerCase()} que requer atenção ${isUrgent ? 'urgente' : 'normal'
                        }.`,
                    category: category,
                    priority: isUrgent ? 'URGENTE' : 'NORMAL',
                    status: randomItem(statuses),
                    location:
                        Math.random() > 0.5 ? `Fração ${randomItem(fractions).number}` : 'Zona comum',
                    reportedBy: randomItem(portugueseNames),
                    reportedAt: reportedDate,
                    slaDeadline: slaDeadline,
                    assignedSupplierId: Math.random() > 0.3 ? randomItem(suppliers).id : null,
                    resolvedAt: isResolved ? randomDate(reportedDate, now) : null,
                    notes: Math.random() > 0.5 ? 'Notas adicionais sobre a ocorrência.' : null,
                },
            });
        }

        // Create projects
        const numProjects = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < numProjects; i++) {
            const projectStatuses = [
                'PLANEAMENTO',
                'EM_APROVACAO',
                'APROVADO',
                'EM_EXECUCAO',
                'CONCLUIDO',
            ];

            await prisma.project.create({
                data: {
                    condominiumId: condominium.id,
                    title: `Obra de ${randomItem([
                        'Pintura',
                        'Renovação',
                        'Impermeabilização',
                        'Modernização',
                    ])} - ${condominium.name}`,
                    description: 'Projeto de melhoria das infraestruturas do condomínio.',
                    status: randomItem(projectStatuses),
                    budgetEstimate: 5000 + Math.random() * 45000,
                    startDate: Math.random() > 0.5 ? randomDate(startDate, now) : null,
                    endDate:
                        Math.random() > 0.5
                            ? randomDate(now, new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000))
                            : null,
                    supplierId: Math.random() > 0.3 ? randomItem(suppliers).id : null,
                    notes: 'Notas sobre o projeto.',
                },
            });
        }

        // Create assemblies
        const numAssemblies = 1 + Math.floor(Math.random() * 3);
        const years = [2024, 2025, 2026];

        for (let i = 0; i < numAssemblies; i++) {
            const assemblyStatuses = ['NAO_MARCADA', 'AGENDADA', 'REALIZADA', 'CANCELADA'];
            const status = randomItem(assemblyStatuses);
            const type = randomItem(['AGO', 'AGE']);
            const year = randomItem(years);

            const assemblyDate = status !== 'NAO_MARCADA'
                ? randomDate(now, new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000))
                : null;

            const assembly = await prisma.assembly.create({
                data: {
                    condominiumId: condominium.id,
                    year: year,
                    type: type,
                    status: status,
                    date: assemblyDate,
                    location: status !== 'NAO_MARCADA' ? 'Salão do Condomínio' : null,
                    agendaItems: {
                        create: [
                            { order: 1, title: 'Aprovação de Contas ' + (year - 1), description: 'Discussão e votação do relatório e contas.' },
                            { order: 2, title: 'Orçamento ' + year, description: 'Apresentação e votação do orçamento previsional.' },
                            { order: 3, title: 'Obras de Manutenção', description: 'Análise de propostas para pintura da fachada.' },
                            { order: 4, title: 'Outros Assuntos', description: 'Assuntos de interesse geral.' }
                        ]
                    },
                    decisions: status === 'REALIZADA' ? {
                        create: [
                            { description: 'Aprovação de contas ' + (year - 1), result: 'APROVADA' },
                            { description: 'Orçamento ' + year, result: 'APROVADA' },
                            { description: 'Obras de Manutenção', result: 'ADIADA' }
                        ]
                    } : undefined,
                    minutes: status === 'REALIZADA' ? {
                        create: {
                            content: '<p>Ata da Assembleia Geral Ordinária...</p>',
                            signedFile: `/documents/${condominium.id}/ata_${year}.pdf`
                        }
                    } : undefined
                },
            });
        }

        // Create documents
        const documentCategories = ['ATA', 'CONTRATO', 'FATURA', 'SEGURO', 'OUTROS']; // Updated categories
        const condoAssemblies = await prisma.assembly.findMany({ where: { condominiumId: condominium.id } });
        const numDocuments = 5 + Math.floor(Math.random() * 5);

        for (let i = 0; i < numDocuments; i++) {
            const category = randomItem(documentCategories);
            const linkedAssembly = category === 'ATA' && condoAssemblies.length > 0 ? randomItem(condoAssemblies) : null;
            const linkedSupplier = category === 'FATURA' ? randomItem(suppliers) : null;

            await prisma.document.create({
                data: {
                    condominiumId: condominium.id,
                    assemblyId: linkedAssembly?.id,
                    supplierId: linkedSupplier?.id,
                    category: category,
                    title: `${category} - ${condominium.name} - ${i + 1}`,
                    fileName: `documento_${i + 1}.pdf`,
                    filePath: `/documents/${condominium.id}/documento_${i + 1}.pdf`,
                    fileSize: Math.floor(50000 + Math.random() * 950000),
                    mimeType: 'application/pdf',
                    tags: randomItem(['importante', 'urgente', 'arquivo', null]),
                    uploadedBy: randomItem(['admin@condoflow.pt', 'gestor@condoflow.pt']),
                    version: 1,
                    versions: {
                        create: {
                            version: 1,
                            fileName: `documento_${i + 1}.pdf`,
                            filePath: `/documents/${condominium.id}/documento_${i + 1}.pdf`,
                            fileSize: Math.floor(50000 + Math.random() * 950000),
                            mimeType: 'application/pdf',
                            uploadedBy: 'admin@condoflow.pt'
                        }
                    }
                },
            });
        }
    }

    // Update condominium stats based on created data
    const allCondominiums = await prisma.condominium.findMany({
        include: {
            fractions: true,
            occurrences: true,
            assemblies: true,
            transactions: true,
        },
    });

    for (const condo of allCondominiums) {
        const urgentCount = condo.occurrences.filter(
            (o) => o.priority === 'URGENTE' && o.status !== 'RESOLVIDA' && o.status !== 'ARQUIVADA'
        ).length;

        const openCount = condo.occurrences.filter(
            (o) => o.status !== 'RESOLVIDA' && o.status !== 'ARQUIVADA'
        ).length;

        const totalDebt = condo.fractions.reduce((sum, f) => sum + f.debtAmount, 0);

        const nextAssembly = condo.assemblies
            .filter((a) => a.date && a.date > new Date())
            .sort((a, b) => (a.date! > b.date! ? 1 : -1))[0];

        // Calculate balance
        const income = condo.transactions
            .filter((t) => t.type === 'RECEITA')
            .reduce((sum, t) => sum + t.amount, 0);

        const expenses = condo.transactions
            .filter((t) => t.type === 'DESPESA')
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = income - expenses;

        // Determine risk level
        let riskLevel = 'LOW';
        if (totalDebt > 5000 || urgentCount > 2) riskLevel = 'HIGH';
        else if (totalDebt > 2000 || urgentCount > 0 || balance < 1000) riskLevel = 'MEDIUM';

        await prisma.condominium.update({
            where: { id: condo.id },
            data: {
                urgentOccurrences: urgentCount,
                openOccurrences: openCount,
                debtTotal: totalDebt,
                balance: balance,
                nextAssemblyDate: nextAssembly?.date,
                riskLevel: riskLevel,
            },
        });
    }

    console.log('✅ Updated condominium statistics');
    console.log('');
    console.log('🎉 Seed completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Suppliers: ${suppliers.length}`);
    console.log(`   Condominiums: ${condominiumsData.length}`);
    console.log(`   Fractions: ~80`);
    console.log(`   Occurrences: ~40`);
    console.log(`   Transactions: 200+`);
    console.log(`   Projects: ~12`);
    console.log(`   Assemblies: ~12`);
    console.log(`   Documents: ~40`);
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
