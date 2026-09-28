import { v4 as uuidv4 } from 'uuid';
import type {
    SmartPlan,
    TrainingGoal,
    SpecialistSuggestion,
    Exercise,
    PlanMacroTargets,
    PlanMeal,
    PlanSupplement,
    PeriodizationPhase
} from '@/types';

export interface PlanUserContext {
    name?: string;
    age?: number;
    height?: number;
    weight?: number;
    gender?: string;
    experienceLevel?: string;
}

/**
 * Gera um plano inteligente hiper-completo baseado nas métricas e objetivo do usuário
 */
export function generateSmartPlan(goal: TrainingGoal, context?: PlanUserContext): SmartPlan {
    const now = new Date();
    const endDate = new Date();
    endDate.setMonth(now.getMonth() + 6); // Ciclo de 6 meses

    // Métricas com fallbacks realistas
    const weight = context?.weight && context.weight > 30 ? context.weight : 75;
    const height = context?.height && context.height > 100 ? context.height : 175;
    const age = context?.age && context.age > 12 ? context.age : 26;
    const isFemale = context?.gender === 'feminino';

    // 1. Taxa Metabólica Basal (Fórmula de Mifflin-St Jeor)
    const bmr = isFemale
        ? 10 * weight + 6.25 * height - 5 * age - 161
        : 10 * weight + 6.25 * height - 5 * age + 5;

    // Gasto Calórico Total estimado (Fator de atividade moderada 1.45)
    const tdee = Math.round(bmr * 1.45);

    // Ajuste calórico por objetivo
    let targetCalories: number;
    let proteinPerKg: number;
    let fatPerKg = 0.9;

    if (goal === 'emagrecimento') {
        targetCalories = Math.max(1400, Math.round(tdee - 450));
        proteinPerKg = 2.2; // Alta proteína para preservar massa magra em déficit
        fatPerKg = 0.8;
    } else if (goal === 'hipertrofia') {
        targetCalories = Math.round(tdee + 380); // Superávit moderado limpo
        proteinPerKg = 2.0;
        fatPerKg = 1.0;
    } else if (goal === 'condicionamento') {
        targetCalories = Math.round(tdee - 150);
        proteinPerKg = 1.8;
        fatPerKg = 0.9;
    } else {
        // Manutenção
        targetCalories = tdee;
        proteinPerKg = 1.9;
        fatPerKg = 0.9;
    }

    const proteinGrams = Math.round(weight * proteinPerKg);
    const fatGrams = Math.round(weight * fatPerKg);
    const proteinKcal = proteinGrams * 4;
    const fatKcal = fatGrams * 9;
    const remainingKcal = Math.max(0, targetCalories - (proteinKcal + fatKcal));
    const carbsGrams = Math.round(remainingKcal / 4);
    const fiberGrams = Math.round((targetCalories / 1000) * 14);

    const macroTargets: PlanMacroTargets = {
        calories: targetCalories,
        protein: proteinGrams,
        carbs: carbsGrams,
        fats: fatGrams,
        fiber: fiberGrams
    };

    // 2. Cardápio de Refeições Estruturadas
    const isCut = goal === 'emagrecimento';
    const meals: PlanMeal[] = [
        {
            id: 'meal_1',
            name: 'Café da Manhã Energético',
            time: '07:30',
            calories: Math.round(targetCalories * 0.22),
            macros: {
                protein: Math.round(proteinGrams * 0.25),
                carbs: Math.round(carbsGrams * 0.22),
                fats: Math.round(fatGrams * 0.20)
            },
            foods: isCut ? [
                { id: 'f1', name: 'Ovos inteiros mexidos', portion: '2 unidades (100g)', calories: 140 },
                { id: 'f2', name: 'Claras de ovo pasteurizadas ou cozidas', portion: '2 claras (60g)', calories: 34 },
                { id: 'f3', name: 'Aveia em flocos finos', portion: '35g', calories: 125 },
                { id: 'f4', name: 'Morangos frescos ou mamão', portion: '100g', calories: 45 },
                { id: 'f5', name: 'Café preto ou chá verde', portion: '200ml (sem açúcar)', calories: 2 }
            ] : [
                { id: 'f1', name: 'Ovos caipiras mexidos', portion: '3 unidades (150g)', calories: 210 },
                { id: 'f2', name: 'Aveia em flocos integrais', portion: '60g', calories: 220 },
                { id: 'f3', name: 'Banana prata fatiada', portion: '1 unidade grande (90g)', calories: 95 },
                { id: 'f4', name: 'Pasta de amendoim integral', portion: '1 colher de sopa (15g)', calories: 90 },
                { id: 'f5', name: 'Café com canela', portion: '200ml', calories: 5 }
            ],
            substitutions: [
                'Trocar ovos por 30g de Whey Protein + 150ml de iogurte natural desnatado',
                'Trocar aveia por 2 fatias de pão 100% integral ou 60g de tapioca com chia',
                'Trocar banana por 1 maçã gala ou 150g de melão'
            ]
        },
        {
            id: 'meal_2',
            name: 'Almoço Principal de Performance',
            time: '12:30',
            calories: Math.round(targetCalories * 0.32),
            macros: {
                protein: Math.round(proteinGrams * 0.35),
                carbs: Math.round(carbsGrams * 0.35),
                fats: Math.round(fatGrams * 0.30)
            },
            foods: isCut ? [
                { id: 'f6', name: 'Peito de frango grelhado ou filé de tilápia', portion: '160g', calories: 195 },
                { id: 'f7', name: 'Arroz branco ou integral cozido', portion: '110g', calories: 140 },
                { id: 'f8', name: 'Feijão carioca ou lentilha', portion: '80g', calories: 65 },
                { id: 'f9', name: 'Prato farto de brócolis, couve e rúcula', portion: '150g', calories: 40 },
                { id: 'f10', name: 'Azeite de oliva extra virgem', portion: '1 colher de chá (5ml)', calories: 45 }
            ] : [
                { id: 'f6', name: 'Peito de frango ou patinho moído grelhado', portion: '180g', calories: 240 },
                { id: 'f7', name: 'Arroz branco ou parboilizado cozido', portion: '180g', calories: 235 },
                { id: 'f8', name: 'Feijão preto ou carioca', portion: '110g', calories: 90 },
                { id: 'f9', name: 'Salada de folhas verdes, cenoura e tomate', portion: '100g', calories: 35 },
                { id: 'f10', name: 'Azeite de oliva extra virgem', portion: '1 colher de sobremesa (8ml)', calories: 72 }
            ],
            substitutions: [
                'Trocar peito de frango por patinho moído (160g), filé mignon ou salmão',
                'Trocar arroz por batata doce assada (200g) ou mandioca/aipim cozido',
                'Trocar feijão por grão de bico cozido ou lentilhas'
            ]
        },
        {
            id: 'meal_3',
            name: 'Lanche da Tarde / Pré-Treino',
            time: '16:00',
            calories: Math.round(targetCalories * 0.18),
            macros: {
                protein: Math.round(proteinGrams * 0.18),
                carbs: Math.round(carbsGrams * 0.20),
                fats: Math.round(fatGrams * 0.15)
            },
            foods: isCut ? [
                { id: 'f11', name: 'Whey Protein Concentrado ou Isolado', portion: '30g (1 scoop)', calories: 120 },
                { id: 'f12', name: 'Maçã verde ou vermelha', portion: '1 unidade média (120g)', calories: 65 },
                { id: 'f13', name: 'Castanha-do-Pará', portion: '2 unidades (8g)', calories: 55 }
            ] : [
                { id: 'f11', name: 'Iogurte natural integral ou proteico', portion: '170g', calories: 110 },
                { id: 'f12', name: 'Whey Protein sabor baunilha ou chocolate', portion: '30g', calories: 120 },
                { id: 'f13', name: 'Aveia em flocos ou granola sem açúcar', portion: '30g', calories: 115 },
                { id: 'f14', name: 'Uva passa ou mel puro', portion: '1 colher de chá (10g)', calories: 30 }
            ],
            substitutions: [
                'Trocar Whey por 1 sanduíche de atum sólido em água com pão integral',
                'Trocar maçã por 100g de uvas frescas ou 1 pera',
                'Trocar castanha por 10g de sementes de abóbora ou nozes'
            ]
        },
        {
            id: 'meal_4',
            name: 'Jantar Reparador Pós-Treino',
            time: '19:45',
            calories: Math.round(targetCalories * 0.22),
            macros: {
                protein: Math.round(proteinGrams * 0.20),
                carbs: Math.round(carbsGrams * 0.20),
                fats: Math.round(fatGrams * 0.25)
            },
            foods: isCut ? [
                { id: 'f15', name: 'Filé de tilápia ou sobrecoxa sem pele', portion: '170g', calories: 180 },
                { id: 'f16', name: 'Abóbora cabotiá assada ou batata inglesa', portion: '130g', calories: 105 },
                { id: 'f17', name: 'Mix de folhas verdes e abobrinha refogada', portion: '120g', calories: 35 },
                { id: 'f18', name: 'Azeite de oliva', portion: '1 colher de chá (5ml)', calories: 45 }
            ] : [
                { id: 'f15', name: 'Patinho moído ou filé de frango grelhado', portion: '170g', calories: 230 },
                { id: 'f16', name: 'Batata doce ou mandioca cozida', portion: '160g', calories: 180 },
                { id: 'f17', name: 'Legumes no vapor (brócolis, cenoura, vagem)', portion: '120g', calories: 45 },
                { id: 'f18', name: 'Azeite de oliva extra virgem', portion: '1 colher de sobremesa (8ml)', calories: 72 }
            ],
            substitutions: [
                'Trocar carne por omelete de 3 ovos com espinafre e queijo branco',
                'Trocar batata por 120g de arroz integral ou purê de mandioquinha',
                'Trocar tilápia por atum grelhado ou filé de frango desfiado'
            ]
        },
        {
            id: 'meal_5',
            name: 'Ceia Noturna & Síntese Noturna',
            time: '22:30',
            calories: Math.round(targetCalories * 0.06),
            macros: {
                protein: Math.round(proteinGrams * 0.02),
                carbs: Math.round(carbsGrams * 0.03),
                fats: Math.round(fatGrams * 0.10)
            },
            foods: isCut ? [
                { id: 'f19', name: 'Chá de camomila, melissa ou capim-limão', portion: '250ml', calories: 2 },
                { id: 'f20', name: 'Ovo cozido ou queijo cottage', portion: '1 unidade / 40g', calories: 70 },
                { id: 'f21', name: 'Castanha de caju', portion: '2 unidades (6g)', calories: 35 }
            ] : [
                { id: 'f19', name: 'Iogurte natural desnatado ou queijo cottage', portion: '120g', calories: 80 },
                { id: 'f20', name: 'Pasta de amendoim ou abacate', portion: '1 colher de chá (10g)', calories: 60 },
                { id: 'f21', name: 'Chá calmante com gotas de limão', portion: '200ml', calories: 2 }
            ],
            substitutions: [
                'Trocar por 20g de Caseína ou Albumina com água fria',
                'Trocar castanha por 1 pedaço pequeno de chocolate 85% cacau (10g)'
            ]
        }
    ];

    // 3. Protocolo de Suplementação Estruturado
    const supplements: PlanSupplement[] = [
        {
            id: 'supp_creatina',
            name: 'Creatina Monohidratada 100% Pura',
            timing: 'pos_treino',
            timingLabel: 'Diariamente (fixo no pós-treino ou café)',
            dosage: '5g ao dia com 200ml de água',
            purpose: 'Ressíntese rápida de ATP, aumento sustentado de força e retenção hídrica intracelular no músculo.'
        },
        {
            id: 'supp_whey',
            name: 'Whey Protein (Concentrado ou Isolado)',
            timing: 'pos_treino',
            timingLabel: 'Imediatamente pós-treino ou no lanche',
            dosage: '30g a 40g em 200ml de água gelada',
            purpose: 'Aporte de aminoácidos essenciais (alto teor de leucina) para ativação do sinalizador anabólico mTOR.'
        },
        {
            id: 'supp_multi',
            name: 'Complexo Multivitamínico & Minerais A-Z',
            timing: 'jejum',
            timingLabel: 'Junto à primeira refeição sólida (café da manhã)',
            dosage: '1 cápsula ao dia',
            purpose: 'Cofator para processos enzimáticos, produção energética, equilíbrio hormonal e sistema imunológico.'
        },
        {
            id: 'supp_omega3',
            name: 'Ômega 3 Ultra Concentrado (EPA/DHA)',
            timing: 'refeicao',
            timingLabel: 'Junto ao almoço ou jantar',
            dosage: '2 cápsulas (mínimo de 1000mg de EPA + DHA)',
            purpose: 'Ação anti-inflamatória sistêmica, melhora da sensibilidade à insulina e saúde articular.'
        }
    ];

    if (isCut) {
        supplements.splice(1, 0, {
            id: 'supp_cafeina',
            name: 'Cafeína Anidra / Termogênico Limpo',
            timing: 'pre_treino',
            timingLabel: '30 a 40 minutos antes do treino',
            dosage: '150mg a 210mg',
            purpose: 'Estímulo do sistema nervoso central, aumento da taxa metabólica basal e maior oxidação de ácidos graxos.'
        });
    } else {
        supplements.push({
            id: 'supp_magnesio',
            name: 'Magnésio Quelato / Dimalato + Zinco',
            timing: 'noite',
            timingLabel: '30 minutos antes de dormir',
            dosage: '250mg a 350mg de Magnésio elementar',
            purpose: 'Relaxamento do tônus muscular, aumento do sono profundo (estágio REM) e recuperação neural.'
        });
    }

    // 4. Meta de Água (38ml por kg)
    const waterTarget = Math.round(weight * 38);

    // 5. Fases de Periodização
    const phases: PeriodizationPhase[] = [
        {
            phase: 1,
            title: 'Fase 1: Adaptação & Eficiência Mecânica',
            duration: 'Meses 1 e 2',
            focus: 'Volume moderado (12-15 reps), cadência 2-0-2, aprendizado motor, adaptação tendínea e base metabólica.',
            active: true
        },
        {
            phase: 2,
            title: 'Fase 2: Hipertrofia & Sobrecarga Progressiva',
            duration: 'Meses 3 e 4',
            focus: 'Aumento expressivo de cargas (8-12 reps), foco em tensão mecânica e recrutamento de unidades motoras rápidas.',
            active: false
        },
        {
            phase: 3,
            title: 'Fase 3: Densidade, Força & Consolidação',
            duration: 'Meses 5 e 6',
            focus: 'Séries de intensidade (6-10 reps), técnicas avançadas (rest-pause, drop-sets estratégicos) e consolidação física.',
            active: false
        }
    ];

    // 6. Orientações dos Especialistas
    const suggestions: SpecialistSuggestion[] = [
        {
            id: uuidv4(),
            specialistType: 'nutrologa',
            title: 'Protocolo Metabólico & Hormonal',
            content: isCut
                ? `### Estratégia Metabólica para Queima de Gordura\n` +
                  `- **Déficit Calórico Calculado**: Programado para **${targetCalories} kcal/dia**, gerando oxidação lipídica sem degradação de massa magra.\n` +
                  `- **Sensibilidade à Insulina**: Concentramos 70% dos carboidratos nas refeições peri-treino (café e almoço/pós-treino).\n` +
                  `- **Ambiente Hormonal**: Mantenha hidratação em **${(waterTarget / 1000).toFixed(1)}L** e priorize 7h a 8h de sono profundo para otimização de GH e controle de cortisol.`
                : `### Otimização Metabólica para Ganho Muscular\n` +
                  `- **Superávit Energético Anabólico**: Estabelecido em **${targetCalories} kcal/dia**, fornecendo energia excedente para a síntese protéica muscular.\n` +
                  `- **Proteção Renal e Hepática**: Com o aporte de **${proteinGrams}g de proteína**, a ingestão hídrica mínima de **${(waterTarget / 1000).toFixed(1)}L/dia** é mandatória.\n` +
                  `- **Timing de Nutrientes**: O fornecimento de aminoácidos a cada 3-4 horas mantém o balanço nitrogenado positivo durante todo o dia.`,
            date: now.toISOString()
        },
        {
            id: uuidv4(),
            specialistType: 'nutricionista',
            title: 'Estrutura Nutricional de Precisão',
            content: `### Divisão de Macronutrientes por Peso Corporal (${weight}kg)\n` +
                `- **Proteínas**: **${proteinGrams}g/dia** (~${proteinPerKg}g/kg) | Responsável pela reconstrução de miofibrilas.\n` +
                `- **Carboidratos**: **${carbsGrams}g/dia** | Principal combustível para treinos intensos e manutenção de glicogênio muscular.\n` +
                `- **Gorduras Boas**: **${fatGrams}g/dia** | Essenciais para a produção de hormônios esteróides como a testosterona.\n` +
                `- **Fibras**: **${fiberGrams}g/dia** | Saúde da microbiota intestinal e controle glicêmico.\n\n` +
                `### Regra de Ouro da Aderência\n` +
                `Pese os alimentos prontos/cozidos na balança de cozinha para garantir a precisão calórica durante as primeiras 4 semanas.`,
            date: now.toISOString()
        },
        {
            id: uuidv4(),
            specialistType: 'personal',
            title: 'Metodologia e Fisiologia do Treino',
            content: `### Diretrizes para Máximo Estímulo Mecânico\n` +
                `- **Aquecimento Específico**: Sempre realize 2 séries de aquecimento com 40-50% da carga antes do primeiro exercício pesado.\n` +
                `- **Proximidade da Falha (RIR 1-2)**: Treine deixando de 1 a 2 repetições na reserva para garantir estímulo efetivo sem exaustão do SNC.\n` +
                `- **Cadência Excêntrica**: Controle a descida do peso (2 a 3 segundos). É na fase excêntrica que ocorrem os maiores microdanos adaptativos.\n` +
                `- **Cardio Estruturado**: 20 a 25 minutos de cardio em intensidade moderada (zona 2, frequência cardíaca ~120-135 bpm) 3x a 4x na semana.`,
            date: now.toISOString()
        }
    ];

    return {
        id: uuidv4(),
        goal,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        suggestions,
        diet: isCut ? 'Déficit Calórico Orientado' : 'Superávit Calórico Limpo',
        supplementation: isCut ? 'Protocolo Queima & Definição' : 'Protocolo Hipertrofia & Força',
        macroTargets,
        meals,
        supplements,
        waterTarget,
        waterConsumed: 0,
        waterLogDate: now.toISOString().slice(0, 10),
        phases
    };
}

/**
 * Retorna instruções técnicas baseadas no exercício
 */
export function getExerciseInstructions(name: string): string[] {
    const slug = name
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '_')
        .replace(/[^\w]/g, '');

    const instructionsMap: Record<string, string[]> = {
        'supino_reto': [
            'Mantenha os calcanhares no chão e as escápulas retraídas.',
            'Desça a barra até tocar levemente o peito (altura dos mamilos).',
            'Evite travar os cotovelos no topo da subida.',
            'Inspire na descida e expire na subida (fase de esforço).'
        ],
        'agachamento': [
            'Mantenha os pés na largura dos ombros, apontados levemente para fora.',
            'Inicie o movimento pelo quadril para trás, como se fosse sentar.',
            'Mantenha o peito aberto e o olhar para frente.',
            'Desça até que as coxas fiquem pelo menos paralelas ao chão.'
        ],
        'puxada_frente': [
            'Puxe a barra em direção ao peito, não por trás do pescoço.',
            'Inicie o movimento puxando os cotovelos para baixo e para trás.',
            'Mantenha o tronco levemente inclinado para trás.',
            'Controle o retorno da barra sem deixar os ombros subirem demais.'
        ],
        'rosca_direta': [
            'Mantenha os cotovelos colados ao tronco durante todo o movimento.',
            'Evite balançar o corpo para usar o embalo (mantenha o core firme).',
            'Execute a amplitude total, descendo até quase esticar o braço.',
            'Foque na contração do bíceps no topo do movimento.'
        ],
        'crucifixo': [
            'Mantenha uma leve flexão nos cotovelos (como se abraçasse um barril).',
            'Abra os braços até sentir o alongamento do peitonal.',
            'Não deixe os pesos baterem um no outro no topo do movimento.',
            'Mantenha as escápulas grudadas no banco.'
        ]
    };

    return instructionsMap[slug] || [
        'Mantenha a execução controlada e o foco no músculo alvo.',
        'Controle a fase excêntrica (descida) para maximizar o estímulo.',
        'Respire de forma rítmica, evitando a apneia.',
        'Mantenha a postura e a coluna alinhada durante todo o set.'
    ];
}

/**
 * Retorna uma URL de GIF baseada no nome do exercício (usando DB pública)
 */
export function getExerciseMedia(name: string): string {
    // ... existing getExerciseMedia code
    const slug = name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '_')
        .replace(/[^\w]/g, '');

    // Lista de mapeamento para nomes comuns em português para o inglês do BD
    const mapping: Record<string, string> = {
        'supino_reto': 'bench_press',
        'supino_inclinado': 'inclined_bench_press',
        'agachamento': 'squat',
        'levantamento_terra': 'deadlift',
        'rosca_direta': 'biceps_curl',
        'triceps_pulley': 'triceps_pushdown',
        'puxada_frente': 'lat_pulldown',
        'remada_curvada': 'bent_over_row',
        'leg_press': 'leg_press',
        'extensora': 'leg_extension',
        'flexora': 'leg_curl',
        'desenvolvimento': 'shoulder_press',
        'elevacao_lateral': 'lateral_raise',
    };

    const apiKeyName = mapping[slug] || slug;

    // Usando uma estrutura conhecida do Github que contém GIFs de exercícios
    // Formato: https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/[Name]/0.gif
    // Nota: Como não temos a lista completa, tentamos um padrão de Capitalize_Space
    const formalName = apiKeyName.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('_');

    return `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${formalName}/0.gif`;
}

/**
 * Gera exercícios com a estrutura de logs de séries
 */
export function enrichExerciseWithSets(exercise: Omit<Exercise, 'id'>): Exercise {
    const setsCount = Number(exercise.sets) || 3;
    const repsVal = parseInt(exercise.reps) || 12;

    const sets_log = Array.from({ length: setsCount }).map(() => ({
        id: uuidv4(),
        reps: repsVal,
        weight: 0,
        completed: false
    }));

    return {
        ...exercise,
        id: uuidv4(),
        sets_log,
        videoUrl: exercise.videoUrl || getExerciseMedia(exercise.name),
        instructions: exercise.instructions && exercise.instructions.length > 0
            ? exercise.instructions
            : getExerciseInstructions(exercise.name),
        completed: false
    };
}
