// Minimal stub of the `ai` runtime so references to `@/ai/genkit` do not
// crash the server after removing the full genkit integration.
export const ai = {
  definePrompt: (_opts: any) => {
    return async (_input: any) => ({
      output: {
        suggestedAdjustments: JSON.stringify([]),
        reasoning: 'AI integration removed in this build.',
      },
    });
  },
  defineFlow: (_cfg: any, handler: any) => {
    return handler;
  },
};
