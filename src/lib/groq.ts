/**
 * Client-side helper: calls a secure server endpoint that talks to Groq.
 * No API keys are exposed in the browser.
 */

const GROQ_ENDPOINT = import.meta.env.VITE_GROQ_API_ENDPOINT || '/api/groq-plan';

export async function generateGroqPlan(userContext: {
  name: string;
  age: number;
  height: number;
  weight: number;
  goal: string;
  gender: string;
  experienceLevel: string;
}) {
  try {
    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userContext }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro no endpoint Groq:', errorText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao gerar plano via endpoint Groq:', error);
    return null;
  }
}
