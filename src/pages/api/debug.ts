import type { APIRoute } from 'astro';
import { haalQueryResult } from '../../lib/allunited-api';

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  // Runtime env van Cloudflare Pages (beschikbaar via de Cloudflare adapter)
  const runtimeEnv = (locals as any).runtime?.env ?? {};

  // Beveilig met een token — stel DEBUG_TOKEN in als Cloudflare Pages env var
  const debugToken = runtimeEnv['DEBUG_TOKEN'] || import.meta.env.DEBUG_TOKEN;
  if (!debugToken) {
    return new Response('Debug endpoint is uitgeschakeld (DEBUG_TOKEN niet ingesteld).', { status: 403 });
  }
  const url = new URL(request.url);
  if (url.searchParams.get('token') !== debugToken) {
    return new Response('Ongeldig token.', { status: 403 });
  }

  const result: Record<string, any> = {
    env: {
      ALLUNITED_API_URL: !!(runtimeEnv['ALLUNITED_API_URL'] || import.meta.env.ALLUNITED_API_URL),
      ALLUNITED_CLIENT_ID: !!(runtimeEnv['ALLUNITED_CLIENT_ID'] || import.meta.env.ALLUNITED_CLIENT_ID),
      ALLUNITED_API_KEY: !!(runtimeEnv['ALLUNITED_API_KEY'] || import.meta.env.ALLUNITED_API_KEY),
      ALLUNITED_SECTION: !!(runtimeEnv['ALLUNITED_SECTION'] || import.meta.env.ALLUNITED_SECTION),
      ALLUNITED_QUERY_ID: !!(runtimeEnv['ALLUNITED_QUERY_ID'] || import.meta.env.ALLUNITED_QUERY_ID),
      CALENDAR_ICS_URL: !!(runtimeEnv['CALENDAR_ICS_URL'] || import.meta.env.CALENDAR_ICS_URL),
    },
    allunited: null,
    calendar: null,
  };

  // Test AllUnited API
  const queryId = (runtimeEnv['ALLUNITED_QUERY_ID'] || import.meta.env.ALLUNITED_QUERY_ID) as string | undefined;
  if (queryId) {
    try {
      const queryResult = await haalQueryResult(queryId, runtimeEnv);
      result.allunited = {
        success: !!queryResult,
        aantalItems: queryResult?.data?.length ?? 0,
      };
    } catch (error: any) {
      result.allunited = { success: false, error: error.message };
    }
  } else {
    result.allunited = { success: false, error: 'ALLUNITED_QUERY_ID ontbreekt' };
  }

  // Test kalender URL bereikbaarheid
  const calendarUrl = (runtimeEnv['CALENDAR_ICS_URL'] || import.meta.env.CALENDAR_ICS_URL) as string | undefined;
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
