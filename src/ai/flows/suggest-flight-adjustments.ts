"use server";

// Stubbed flow to keep references stable while AI code is removed.
export type FlightAdjustmentInput = { telemetryData: string; weatherData: string };
export type FlightAdjustmentOutput = { suggestedAdjustments: string; reasoning: string };

export async function suggestFlightAdjustments(_input: FlightAdjustmentInput): Promise<FlightAdjustmentOutput> {
  return {
    suggestedAdjustments: JSON.stringify([]),
    reasoning: 'AI integration removed; no suggestions available.',
  };
}
