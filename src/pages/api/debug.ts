import type { APIRoute } from 'astro';
import { haalQueryResult } from '../../lib/allunited-api';

export const prerender = false;

export const GET: APIRoute = async () => {
  const result: Record<string, any> = {
    env: {
      ALLUNITED_API_URL: import.meta.env.ALLUNITED_API_URL || null,
      ALLUNITED_CLIENT_ID: !!import.meta.env.ALLUNITED_CLIENT_ID,
      ALLUNITED_API_KEY: !!import.meta.env.ALLUNITED_API_KEY,
      ALLUNITED_SECTION: !!import.meta.env.ALLUNITED_SECTION,
      ALLUNITED_QUERY_ID: import.meta.env.ALLUNITED_QUERY_ID || null,
      CALENDAR_ICS_URL: !!import.meta.env.CALENDAR_ICS_URL,
    },
    allunited: null,
    calendar: null,
  };

  // Test AllUnited API
  const queryId = import.meta.env.ALLUNITED_QUERY_ID;
  if (queryId) {
    try {
      const queryResult = await haalQueryResult(queryId);
      result.allunited = {
        success: !!queryResult,
        aantalItems: queryResult?.data?.length ?? 0,
        eersteItem: queryResult?.data?.[0] ?? null,
      };
    } catch (error: any) {
      result.allunited = { success: false, error: error.message };
    }
  } else {
    result.allunited = { success: false, error: 'ALLUNITED_QUERY_ID ontbreekt' };
  }

  // Test kalender URL bereikbaarheid
  const calendarUrl = import.meta.env.CALENDAR_ICS_URL;
  if (calendarUrl) {
    try {
      const response = await fetch(calendarUrl, { headers: { Accept: 'text/calendar' } });
      result.calendar = {
        success: response.ok,
        status: response.status,
        contentType: response.headers.get('content-type'),
        bytesOntvangen: (await response.text()).length,
      };
    } catch (error: any) {
      result.calendar = { success: false, error: error.message };
    }
  } else {
    result.calendar = { success: false, error: 'CALENDAR_ICS_URL ontbreekt' };
  }

  return new Response(JSON.stringify(result, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};
