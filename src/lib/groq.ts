/**
 * IntegraÃ§Ã£o com a API Groq Cloud para geraÃ§Ã£o de planos personalizados.
 */

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function generateGroqPlan(userContext: {
  name: string;
  age: number;
  height: number;
  weight: number;
  goal: string;
  gender: string;
  experienceLevel: string;
}) {
  if (!GROQ_API_KEY) {
    console.error('VITE_GROQ_API_KEY nao configurada.');
    return null;
  }
  const prompt = `
    VocÃª Ã© um SISTEMA DE ELITE composto por uma NutrÃ³loga (Ph.D em Metabologia), um Personal Trainer (Mestre em Fisiologia do ExercÃ­cio) e uma Nutricionista Esportiva.
    Gere um planejamento MESTRE de 6 meses hiper-detalhado para:
    - UsuÃ¡rio: ${userContext.name} (${userContext.gender}, ${userContext.age} anos)
    - Bio: ${userContext.height}cm, ${userContext.weight}kg
    - NÃ­vel: ${userContext.experienceLevel}
    - Objetivo PrimÃ¡rio: ${userContext.goal}

    ### REGRAS DE OURO:
    1. EXCLUSIVIDADE: O plano nÃ£o pode ser genÃ©rico. Use os dados de peso e altura para calcular estimativas (GCD, TMB).
    2. PERIODIZAÃ‡ÃƒO: Divida os 6 meses em Fases (Ex: Meses 1-2: AdaptaÃ§Ã£o/Base, Meses 3-4: IntensificaÃ§Ã£o, Meses 5-6: ConsolidaÃ§Ã£o/Pico).
    3. NUTRIÃ‡ÃƒO: Liste 3 exemplos de refeiÃ§Ãµes (CafÃ©, AlmoÃ§o, Jantar) com quantidades sugeridas (ex: gramas).
    4. SUPLEMENTAÃ‡ÃƒO: Liste dosagens seguras (ex: Creatina 5g/dia, Whey 30g pÃ³s-treino).
    5. TREINO: Explique a metodologia (ex: PPL, ABCDE, GVT) e o foco de cada fase.

    ### FORMATO DE RETORNO (JSON APENAS):
    {
      "diet": "Resumo calÃ³rico e macronutrientes (ex: 2500kcal, 40% Carb, 30% Prot, 30% Fat)",
      "supplementation": "Protocolo de suplementos essenciais",
      "suggestions": [
        { 
          "id": "nutro_01", 
          "specialistType": "nutrologa", 
          "title": "Protocolo MetabÃ³lico e Hormonal", 
          "content": "### AnÃ¡lise MetabÃ³lica\nCom base no seu IMC de [...], vamos focar em [...].\n\n### SuplementaÃ§Ã£o Base\n- **Item 1**: Dosagem e horÃ¡rio.\n- **Item 2**: Por que usar.\n\n### Ciclo de 6 meses\nExplicaÃ§Ã£o do suporte metabÃ³lico ao longo do tempo."
        },
        { 
          "id": "nutri_01", 
          "specialistType": "nutricionista", 
          "title": "Planejamento Alimentar Estruturado", 
          "content": "### EstratÃ©gia Nutricional\nFoco em [...] para o objetivo de ${userContext.goal}.\n\n### Exemplos de RefeiÃ§Ãµes\n- **RefeiÃ§Ã£o 1**: Detalhes...\n- **RefeiÃ§Ã£o 2**: Detalhes...\n\n### Ajustes Progressivos\nComo mudar a dieta a cada 2 meses."
        },
        { 
          "id": "pers_01", 
          "specialistType": "personal", 
          "title": "PeriodizaÃ§Ã£o de Treinamento Pro", 
          "content": "### Metodologia Selecionada\nVamos utilizar [...].\n\n### Fases do Treino\n1. **Fase 1 (MÃªs 1-2)**: Detalhes...\n2. **Fase 2 (MÃªs 3-4)**: Detalhes...\n3. **Fase 3 (MÃªs 5-6)**: Detalhes...\n\n### VariÃ¡veis de Intensidade\nComo progredir carga e volume."
        }
      ]
    }
    
    Responda em PORTUGUÃŠS DO BRASIL. Use Markdown para formatar o conteÃºdo interno das "suggestions".
  `;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'VocÃª Ã© um assistente virtual de saÃºde e fitness de elite que responde apenas em JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro na Groq:', errorData);
      throw new Error('Falha na conexÃ£o com a API Groq Cloud');
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('Erro ao gerar plano com Groq:', error);
    return null;
  }
}

