export const prerender = false;

import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  // Get IP and Geo info from Cloudflare CF object or headers
  const cf = (request as any).cf;
  
  // Extract details
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-real-ip') || 'Unknown IP';
  const city = cf?.city || request.headers.get('cf-ipcity') || '未知城市';
  const region = cf?.region || request.headers.get('cf-region') || '';
  const country = cf?.country || request.headers.get('cf-ipcountry') || 'CN';
  const latitude = cf?.latitude || '39.9'; // Default to Beijing if not found
  const longitude = cf?.longitude || '116.4';

  const fullLocationName = country === 'CN' ? `${region} ${city}`.trim() : `${city}, ${country}`;

  let weatherData = {
    temp: '--',
    weatherCode: 0,
    weatherText: '未知',
    windSpeed: '--'
  };

  try {
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
    );
    if (weatherRes.ok) {
      const data = await weatherRes.json();
      const current = data.current;
      
      // Map WMO Weather Codes to readable texts
      // Reference: https://open-meteo.com/en/docs
      const getWMOText = (code: number) => {
        if (code === 0) return '晴';
        if (code === 1 || code === 2 || code === 3) return '多云';
        if (code >= 45 && code <= 48) return '有雾';
        if (code >= 51 && code <= 55) return '毛毛雨';
        if (code >= 61 && code <= 65) return '下雨';
        if (code >= 71 && code <= 77) return '降雪';
        if (code >= 80 && code <= 82) return '阵雨';
        if (code >= 85 && code <= 86) return '阵雪';
        if (code >= 95 && code <= 99) return '雷阵雨';
        return '晴朗';
      };

      weatherData = {
        temp: current?.temperature_2m ? `${Math.round(current.temperature_2m)}°C` : '--',
        weatherCode: current?.weather_code || 0,
        weatherText: getWMOText(current?.weather_code || 0),
        windSpeed: current?.wind_speed_10m ? `${current.wind_speed_10m} km/h` : '--'
      };
    }
  } catch (e) {
    console.error('Failed to fetch weather from Open-Meteo:', e);
  }

  return new Response(
    JSON.stringify({
      ip,
      location: fullLocationName,
      weather: weatherData
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    }
  );
};
