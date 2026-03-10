const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

type UserContext = {
  name: string;
  age: number;
  height: number;
  weight: number;
  goal: string;
  gender: string;
  experienceLevel: string;
};

type GroqSuggestion = {
  id: string;
  specialistType: 'nutrologa' | 'nutricionista' | 'personal';
  title: string;
  content: string;
};

type GroqPlan = {
  diet: string;
  supplementation: string;
  suggestions: GroqSuggestion[];
};

function buildPrompt(userContext: UserContext) {
  return `
Voce e um SISTEMA DE ELITE composto por uma Nutrologa (PhD em Metabologia),
um Personal Trainer (Mestre em Fisiologia do Exercicio) e uma Nutricionista Esportiva.

Gere um planejamento mestre de 6 meses hiper-detalhado para:
- Usuario: ${userContext.name} (${userContext.gender}, ${userContext.age} anos)
- Bio: ${userContext.height}cm, ${userContext.weight}kg
- Nivel: ${userContext.experienceLevel}
- Objetivo primario: ${userContext.goal}

REGRAS:
1) Exclusividade: nao pode ser generico.
2) Periodizacao: dividir em fases (meses 1-2, 3-4, 5-6).
3) Nutricao: incluir 3 exemplos de refeicoes com quantidades.
4) Suplementacao: incluir dosagens seguras.
5) Treino: metodologia e progressao por fase.

RETORNO: APENAS JSON neste formato:
{
  "diet": "Resumo calorico e macronutrientes",
  "supplementation": "Protocolo de suplementos essenciais",
  "suggestions": [
    {
      "id": "nutro_01",
      "specialistType": "nutrologa",
      "title": "Protocolo Metabolico e Hormonal",
      "content": "### Analise Metabolica\\n...\\n\\n### Suplementacao Base\\n- **Creatina**: ...\\n- **Whey**: ...\\n\\n### Ciclo de 6 meses\\n..."
    },
    {
      "id": "nutri_01",
      "specialistType": "nutricionista",
      "title": "Planejamento Alimentar Estruturado",
      "content": "### Estrategia Nutricional\\n...\\n\\n### Exemplos de Refeicoes\\n- **Cafe da manha**: ...\\n- **Almoco**: ...\\n- **Jantar**: ...\\n\\n### Ajustes Progressivos\\n..."
    },
    {
      "id": "pers_01",
      "specialistType": "personal",
      "title": "Periodizacao de Treinamento Pro",
      "content": "### Metodologia Selecionada\\n...\\n\\n### Fases do Treino\\n1. **Fase 1 (Mes 1-2)**: ...\\n2. **Fase 2 (Mes 3-4)**: ...\\n3. **Fase 3 (Mes 5-6)**: ...\\n\\n### Variaveis de Intensidade\\n..."
    }
  ]
}

Obrigatorio:
- Responder em portugues do Brasil.
- Usar Markdown no campo content.
- Nao incluir texto fora do JSON.
`;
}

function fallbackSuggestion(type: GroqSuggestion['specialistType'], goal: string): GroqSuggestion {
  if (type === 'nutrologa') {
    return {
      id: 'nutro_01',
      specialistType: 'nutrologa',
      title: 'Protocolo Metabolico e Hormonal',
      content:
        `### Analise Metabolica\nPlano focado em ${goal}, com ajustes de metabolismo e composicao corporal.\n\n` +
        `### Suplementacao Base\n- **Creatina**: 3-5g/dia.\n- **Whey**: 25-30g pos-treino.\n\n` +
        `### Ciclo de 6 meses\nDividir em base, intensificacao e consolidacao.`,
    };
  }

  if (type === 'nutricionista') {
    return {
      id: 'nutri_01',
      specialistType: 'nutricionista',
      title: 'Planejamento Alimentar Estruturado',
      content:
        `### Estrategia Nutricional\nPlano alimentar alinhado ao objetivo de ${goal}.\n\n` +
        `### Exemplos de Refeicoes\n- **Cafe da manha**: proteina + carbo de qualidade.\n- **Almoco**: proteina magra + arroz + legumes.\n- **Jantar**: proteina + vegetais + gordura boa.\n\n` +
        `### Ajustes Progressivos\nRevisao a cada 8 semanas.`,
    };
  }

  return {
    id: 'pers_01',
    specialistType: 'personal',
    title: 'Periodizacao de Treinamento Pro',
    content:
      `### Metodologia Selecionada\nDivisao por grupos musculares com progressao.\n\n` +
      `### Fases do Treino\n1. **Fase 1 (Mes 1-2)**: base tecnica e volume moderado.\n2. **Fase 2 (Mes 3-4)**: progressao de carga.\n3. **Fase 3 (Mes 5-6)**: consolidacao e performance.\n\n` +
      `### Variaveis de Intensidade\nControle de carga, volume e descanso.`,
  };
}

function parseJsonSafely(raw: string): Record<string, any> {
  const cleaned = raw.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '');
  return JSON.parse(cleaned);
}

function normalizePlan(data: any, goal: string): GroqPlan {
  const suggestionsInput = Array.isArray(data?.suggestions) ? data.suggestions : [];
  const byType: Partial<Record<GroqSuggestion['specialistType'], GroqSuggestion>> = {};

  suggestionsInput.forEach((s: any) => {
    const type = s?.specialistType;
    if (type === 'nutrologa' || type === 'nutricionista' || type === 'personal') {
      byType[type] = {
        id: typeof s.id === 'string' && s.id.trim() ? s.id : fallbackSuggestion(type, goal).id,
        specialistType: type,
        title: typeof s.title === 'string' && s.title.trim() ? s.title : fallbackSuggestion(type, goal).title,
        content: typeof s.content === 'string' && s.content.trim() ? s.content : fallbackSuggestion(type, goal).content,
      };
    }
  });

  const finalSuggestions: GroqSuggestion[] = [
    byType.nutrologa || fallbackSuggestion('nutrologa', goal),
    byType.nutricionista || fallbackSuggestion('nutricionista', goal),
    byType.personal || fallbackSuggestion('personal', goal),
  ];

  return {
    diet: typeof data?.diet === 'string' && data.diet.trim() ? data.diet : `Plano alimentar orientado para ${goal}.`,
    supplementation:
      typeof data?.supplementation === 'string' && data.supplementation.trim()
        ? data.supplementation
        : 'Protocolo basico com creatina e proteina conforme necessidade.',
    suggestions: finalSuggestions,
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'GROQ_API_KEY not configured' });
    return;
  }

  const userContext: UserContext | undefined = req.body?.userContext;
  if (!userContext) {
    res.status(400).json({ error: 'Missing userContext' });
    return;
  }

  try {
    const prompt = buildPrompt(userContext);

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Voce e um assistente virtual de saude e fitness de elite que responde apenas em JSON.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.6,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      res.status(response.status).json({ error: 'Groq request failed', details: errorData });
      return;
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || '{}';
    const parsed = parseJsonSafely(content);
    const normalized = normalizePlan(parsed, userContext.goal);

    res.status(200).json(normalized);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error', details: error?.message || String(error) });
  }
}
