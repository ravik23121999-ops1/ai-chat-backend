import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

const DEFAULT_MODELS = [
  'gemini-2.5-flash',
  'gemini-flash-latest'
];

const MODEL_TIMEOUT_MS = 12_000;

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private modelCandidates: string[];

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);

    const preferred = process.env.GEMINI_MODEL?.trim();
    this.modelCandidates = preferred
      ? [preferred, ...DEFAULT_MODELS.filter((m) => m !== preferred)]
      : [...DEFAULT_MODELS];
  }

  private getModel(modelName: string): GenerativeModel {
    return this.genAI.getGenerativeModel({ model: modelName });
  }

  private normalizeMessages(messages: unknown[]): string[] {
    return messages
      .map((item) => {
        if (typeof item === 'string') return item.trim();
        if (item && typeof item === 'object') {
          const record = item as Record<string, unknown>;
          const value = record.text ?? record.message ?? record.content;
          if (typeof value === 'string') return value.trim();
        }
        return '';
      })
      .filter(Boolean);
  }

  private extractText(result: Awaited<ReturnType<GenerativeModel['generateContent']>>): string {
    try {
      const text = result.response.text();
      if (!text?.trim()) {
        throw new Error('Gemini returned an empty response');
      }
      return text.trim();
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to read Gemini response text');
    }
  }

  private async generateWithFallback(prompt: string): Promise<string> {
    let lastError: unknown;

    for (const modelName of this.modelCandidates) {
      try {
        const model = this.getModel(modelName);
        const result = await model.generateContent(prompt, {
          timeout: MODEL_TIMEOUT_MS
        });
        return this.extractText(result);
      } catch (error: any) {
        lastError = error;
      }
    }

    throw new Error(
      (lastError as any)?.message || 'All Gemini model attempts failed'
    );
  }

  public async suggestReply(message: string, chatHistory: unknown[] = []): Promise<string> {
    const history = this.normalizeMessages(chatHistory);
    const context = history.join('\n');
    const prompt = `Given this chat history:\n${context}\n\nLast message: "${message}"\n\nSuggest a brief, natural reply (maximum 20 words):`;

    try {
      return await this.generateWithFallback(prompt);
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to generate reply suggestion');
    }
  }

  public async summarizeChat(messages: unknown[]): Promise<string> {
    const normalized = this.normalizeMessages(messages);
    if (normalized.length === 0) {
      throw new Error('No valid messages provided to summarize');
    }

    const clipped = normalized.slice(-40).map((line) => line.slice(0, 500));
    const prompt = `Summarize the following chat conversation in 2-3 sentences:\n${clipped.join('\n')}`;

    try {
      return await this.generateWithFallback(prompt);
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to generate chat summary');
    }
  }
}
