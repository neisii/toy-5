import { errorResponse } from '../utils/errors';
import { jsonResponse } from '../utils/response';

export async function handleOpenMeteo(url: URL): Promise<Response> {
  const lat = url.searchParams.get('lat');
  const lon = url.searchParams.get('lon');

  if (!lat || !lon) {
    return errorResponse('MISSING_PARAMETER', 'lat and lon parameters are required', 400);
  }

  try {
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,windspeed_10m,weathercode&timezone=Asia/Seoul`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) {
      return errorResponse(
        'PROVIDER_ERROR',
        'Failed to fetch weather data',
        response.status,
        'openmeteo'
      );
    }

    return jsonResponse(data);
  } catch (error) {
    console.error('Open-Meteo API error:', error);
    return errorResponse('FETCH_ERROR', 'Failed to fetch from Open-Meteo', 502);
  }
}
