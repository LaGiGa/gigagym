const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

function buildPrompt(userContext: {
  name: string;
  age: number;
  height: number;
  weight: number;
  goal: string;
  gender: string;
  experienceLevel: string;
}) {
  return `
Voce e um sistema especialista de saude e fitness.
Gere um plano de 6 meses para:
- Usuario: ${userContext.name} (${userContext.gender}, ${userContext.age} anos)
- Bio: ${userContext.height}cm, ${userContext.weight}kg
- Nivel: ${userContext.experienceLevel}
- Objetivo: ${userContext.goal}

Regras:
1) Plano especifico, nada generico.
2) Dividir em fases por meses.
3) Nutricao com exemplos de refeicoes.
4) Suplementacao com dosagens seguras.
5) Treino com metodologia e progressao.

Retorne APENAS JSON neste formato:
{
  "diet": "string",
  "supplementation": "string",
  "suggestions": [
    {"id":"nutro_01","specialistType":"nutrologa","title":"string","content":"string"},
    {"id":"nutri_01","specialistType":"nutricionista","title":"string","content":"string"},
    {"id":"pers_01","specialistType":"personal","title":"string","content":"string"}
  ]
}
`;
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

  const userContext = req.body?.userContext;
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
          { role: 'system', content: 'Voce e um assistente de saude e fitness que responde apenas JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      res.status(response.status).json({ error: 'Groq request failed', details: errorData });
      return;
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');
    res.status(200).json(parsed);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error', details: error?.message || String(error) });
  }
}
