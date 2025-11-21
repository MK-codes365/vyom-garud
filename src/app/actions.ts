'use server';

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

export async function getFlightSuggestions(input: { telemetryData: string; weatherData: string }) {
  try {
    // Parse input data for context
    let telemetry: any = {};
    let weather: any = {};
    
    try {
      telemetry = JSON.parse(input.telemetryData);
      weather = JSON.parse(input.weatherData);
    } catch (e) {
      console.log('Could not parse input data');
    }

    // Generate intelligent mock suggestions based on telemetry and weather
    const suggestions = generateSmartSuggestions(telemetry, weather);

    return {
      success: true,
      data: suggestions
    };
  } catch (error) {
    console.error('AI suggestion error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate AI suggestions'
    };
  }
}

function generateSmartSuggestions(telemetry: any, weather: any) {
  const adjustments: string[] = [];
  const reasons: string[] = [];

  // Battery-based suggestions
  if (telemetry.battery && telemetry.battery < 50) {
    adjustments.push('• Reduce flight time - Battery below 50%');
    reasons.push('Low battery detected. Consider returning to home or reducing mission duration.');
  }
  if (telemetry.battery && telemetry.battery > 80) {
    adjustments.push('• Extend mission duration - Battery level optimal');
    reasons.push('Battery is in excellent condition for extended operations.');
  }

  // Altitude-based suggestions
  if (telemetry.altitude && telemetry.altitude > 300) {
    adjustments.push('• Descend to 300ft for better control authority');
    reasons.push('Current altitude above recommended 300ft limit for manual control.');
  }
  if (telemetry.altitude && telemetry.altitude < 50) {
    adjustments.push('• Increase altitude to 100ft for safety margin');
    reasons.push('Current altitude too low. Increase for better obstacle clearance.');
  }

  // Speed-based suggestions
  if (telemetry.speed && telemetry.speed > 30) {
    adjustments.push('• Reduce speed to 15 m/s for stability');
    reasons.push('High speed detected. Reduce for better stability and control.');
  }

  // Wind-based suggestions
  if (weather.wind && weather.wind.includes('15') || weather.wind.includes('20')) {
    adjustments.push('• Maintain heading into wind for stability');
    reasons.push('Moderate to strong wind detected. Adjust heading to maintain position.');
  }

  // Weather-based suggestions
  if (weather.precipitation && weather.precipitation.includes('30') || weather.precipitation.includes('40') || weather.precipitation.includes('50')) {
    adjustments.push('• Consider returning to base - Precipitation risk increasing');
    reasons.push('Precipitation probability moderate. Risk of water damage if prolonged.');
  }

  // Default suggestions if no specific conditions met
  if (adjustments.length === 0) {
    adjustments.push('• Maintain current altitude of ' + (telemetry.altitude || 100) + 'ft');
    adjustments.push('• Continue current heading - Weather conditions optimal');
    adjustments.push('• Monitor battery - Current level: ' + (telemetry.battery || 85) + '%');
    reasons.push('Flight conditions are within optimal parameters. Continue monitoring telemetry and weather updates.');
  }

  return {
    suggestedAdjustments: adjustments.join('\n'),
    reasoning: reasons.length > 0 ? reasons.join(' ') : 'All systems operating within normal parameters.'
  };
}
