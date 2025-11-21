'use server';

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

export async function getFlightSuggestions(input: { telemetryData: string; weatherData: string }) {
  try {
    if (!GEMINI_API_KEY) {
      return {
        success: false,
        error: 'Gemini API key not configured'
      };
    }

    const prompt = `You are an expert drone flight controller AI assistant. Analyze the following telemetry and weather data, then provide optimization suggestions.

TELEMETRY DATA:
${input.telemetryData}

WEATHER DATA:
${input.weatherData}

Please provide optimization suggestions in JSON format with these exact keys:
{
  "suggestedAdjustments": "List specific adjustments (altitude, speed, heading, etc.) as bullet points",
  "reasoning": "Explain why these adjustments improve the mission"
}`;

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=' + GEMINI_API_KEY,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url: 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=' + GEMINI_API_KEY
      });
      
      if (response.status === 404) {
        return {
          success: false,
          error: 'Gemini API endpoint not found (404). The API key or endpoint may be invalid.'
        };
      }
      
      if (response.status === 401) {
        return {
          success: false,
          error: 'Invalid Gemini API key (401). Please check your API key configuration.'
        };
      }
      
      if (response.status === 400) {
        return {
          success: false,
          error: `Bad request (400): ${errorText.substring(0, 100)}`
        };
      }
      
      return {
        success: false,
        error: `Gemini API error: ${response.status} ${response.statusText}`
      };
    }

    const result = await response.json();
    
    if (!result.candidates || !result.candidates[0]?.content?.parts?.[0]?.text) {
      return {
        success: false,
        error: 'Invalid response format from Gemini'
      };
    }

    const text = result.candidates[0].content.parts[0].text;
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        success: false,
        error: 'Could not parse AI response'
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      success: true,
      data: {
        suggestedAdjustments: parsed.suggestedAdjustments,
        reasoning: parsed.reasoning
      }
    };
  } catch (error) {
    console.error('AI suggestion error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate AI suggestions'
    };
  }
}
