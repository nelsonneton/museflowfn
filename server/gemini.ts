import { GoogleGenAI } from "@google/genai";

// Using Google Gemini AI directly via @google/genai package
// This API key is from Google AI Studio

export interface ExtractedDNA {
  nome?: string;
  genero?: string;
  idade?: string;
  formatoRosto?: string;
  tomPele?: string;
  corOlhos?: string;
  formatoSobrancelhas?: string;
  formatoNariz?: string;
  labios?: string;
  cabelo?: string;
  altura?: string;
  tipoCorpo?: string;
  tatuagens?: string;
}

export async function analyzeImageForDNA(imageBuffer: Buffer, mimeType: string, apiKey: string): Promise<ExtractedDNA> {
  const prompt = `Você é um especialista em análise de características físicas para criação de perfis de artistas.

Analise a imagem fornecida e extraia as seguintes características da pessoa:

1. **Formato do Rosto**: Oval, Redondo, Quadrado, Triangular, Diamante, etc.
2. **Tom de Pele**: Claro, Médio, Escuro, com descrição detalhada
3. **Cor dos Olhos**: Castanhos, Azuis, Verdes, Âmbar, etc.
4. **Formato das Sobrancelhas**: Arqueadas, Retas, Finas, Grossas, etc.
5. **Formato do Nariz**: Fino, Largo, Arrebitado, Aquilino, etc.
6. **Lábios**: Finos, Carnudos, Médios, com descrição
7. **Cabelo**: Cor, textura (liso, ondulado, cacheado, crespo), comprimento, estilo
8. **Tipo de Corpo**: Magro, Atlético, Curvilíneo, Plus Size, etc. (se visível)
9. **Tatuagens**: Descreva qualquer tatuagem visível, localização e estilo
10. **Gênero Aparente**: Masculino, Feminino, Não-binário (baseado na aparência)
11. **Idade Aparente**: Estimativa em anos

Retorne APENAS um objeto JSON válido com estas chaves (use nomes em camelCase): formatoRosto, tomPele, corOlhos, formatoSobrancelhas, formatoNariz, labios, cabelo, tipoCorpo, tatuagens, genero, idade.

Importante: Seja descritivo mas conciso. Se algo não for visível na imagem, omita a chave correspondente.`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64');
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Image
              }
            }
          ]
        }
      ],
    });
    
    // Access text from response - .text is a property getter in the SDK
    const generatedText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText || typeof generatedText !== 'string' || generatedText.trim().length === 0) {
      console.error("Gemini response structure:", JSON.stringify(response, null, 2));
      throw new Error("Gemini returned empty or invalid response");
    }
    
    // Parse JSON from response - handle markdown code blocks if present
    let jsonText = generatedText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
    }
    
    const extractedData = JSON.parse(jsonText);
    return extractedData;
  } catch (error) {
    console.error("Gemini Image Analysis error:", error);
    throw new Error(`Failed to analyze image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateLore(concept: string, apiKey: string): Promise<string> {
  const prompt = `Você é um escritor criativo especializado em criar histórias de fundo (LORE) ricas e envolventes para artistas.

Baseado no conceito: "${concept}"

Crie uma história de fundo completa e detalhada para este artista. A história deve incluir:

1. **Origem**: De onde o artista veio, sua infância e formação
2. **Jornada**: Como chegou até onde está hoje, os desafios enfrentados
3. **Motivações**: O que o move, seus sonhos e objetivos
4. **Personalidade**: Traços marcantes, peculiaridades, valores
5. **Estilo**: Como desenvolveu seu estilo único
6. **Marcos**: Momentos importantes que moldaram quem ele é

Escreva em português brasileiro, em um estilo narrativo envolvente, com aproximadamente 300-500 palavras.`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    });
    
    const generatedText = response.text;
    
    if (!generatedText || generatedText.trim().length === 0) {
      throw new Error("Gemini returned empty response");
    }
    
    return generatedText;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(`Failed to generate lore: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
