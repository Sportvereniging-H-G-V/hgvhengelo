/**
 * Kalender API client voor het ophalen van ICS kalender data
 * Haalt events op van een Nextcloud CalDAV public calendar
 */

import ICAL from 'ical.js';

type RuntimeEnv = Record<string, string | undefined>;

const CACHE_KEY = 'https://hgvhengelo.nl/__cache/kalender';
const CACHE_DURATION_SECONDS = 24 * 60 * 60; // 24 uur

export interface CalendarEvent {
  uid: string;
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  isAllDay: boolean;
}

/**
 * Haalt de ICS data op van de kalender URL
 */
async function fetchIcsData(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'text/calendar',
      },
    });

    if (!response.ok) {
      console.error(`Kalender ophalen fout: ${response.status} ${response.statusText}`);
      return null;
    }

    return await response.text();
  } catch (error) {
    console.error('Fout bij ophalen kalender:', error);
    return null;
  }
}

/**
 * Parst ICS data naar CalendarEvent objecten
 */
function parseIcsData(icsData: string): CalendarEvent[] {
  try {
    const jcalData = ICAL.parse(icsData);
    const vcalendar = new ICAL.Component(jcalData);
    const vevents = vcalendar.getAllSubcomponents('vevent');

    const events: CalendarEvent[] = vevents.map((vevent: ICAL.Component) => {
      const event = new ICAL.Event(vevent);

      const startDate = event.startDate?.toJSDate() || new Date();
      const endDate = event.endDate?.toJSDate() || startDate;

      // Check of het een hele-dag event is
      const isAllDay = event.startDate?.isDate || false;

      return {
        uid: event.uid || '',
        title: event.summary || 'Geen titel',
        description: event.description || '',
        location: event.location || '',
        startDate,
        endDate,
        isAllDay,
      };
    });

    return events;
  } catch (error) {
    console.error('Fout bij parsen ICS data:', error);
    return [];
  }
}

/**
 * Filtert events op toekomstige events en sorteert op startdatum
 */
function filterUpcomingEvents(events: CalendarEvent[], limit: number = 5): CalendarEvent[] {
  const now = new Date();
  // Zet tijd naar begin van de dag voor hele-dag events
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return events
    .filter(event => {
      // Voor hele-dag events: vergelijk met begin van vandaag
      // Voor timed events: vergelijk met huidige tijd
      const compareDate = event.isAllDay ? today : now;
      return event.startDate >= compareDate;
    })
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    .slice(0, limit);
}

/**
 * Haalt aankomende kalender events op
 * Gebruikt de Cloudflare Cache API (gedeeld over alle Worker-isolates),
 * slaat de ruwe ICS-tekst op om Date-serialisatie te vermijden.
 */
export async function haalAankomendeEvents(limit: number = 5, env?: RuntimeEnv): Promise<CalendarEvent[]> {
  const calendarUrl = (env?.['CALENDAR_ICS_URL'] as string | undefined) || import.meta.env.CALENDAR_ICS_URL;

  if (!calendarUrl) {
    console.warn('Kalender URL ontbreekt. Voeg CALENDAR_ICS_URL toe aan je .env bestand.');
    return [];
  }

  // Cloudflare Cache API (alleen beschikbaar in Workers runtime)
  if (typeof caches !== 'undefined') {
    const cached = await caches.default.match(CACHE_KEY);
    if (cached) {
      console.log('Kalender ICS opgehaald uit Cloudflare cache');
      const icsData = await cached.text();
      return filterUpcomingEvents(parseIcsData(icsData), limit);
    }
  }

  const icsData = await fetchIcsData(calendarUrl);
  if (!icsData) {
    return [];
  }

  // Sla de ruwe ICS-tekst op in Cloudflare Cache API — apart try/catch zodat
  // een cache-fout de succesvol opgehaalde ICS-data niet weggooit
  if (typeof caches !== 'undefined') {
    try {
      await caches.default.put(
        CACHE_KEY,
        new Response(icsData, {
          headers: {
            'Content-Type': 'text/calendar',
            'Cache-Control': `max-age=${CACHE_DURATION_SECONDS}`,
          },
        })
      );
      console.log('Kalender ICS opgeslagen in Cloudflare cache (geldig voor 24 uur)');
    } catch (cacheError) {
      console.warn('Cloudflare cache schrijven mislukt (data wordt wel teruggegeven):', cacheError);
    }
  }

  return filterUpcomingEvents(parseIcsData(icsData), limit);
}

/**
 * Formatteert een datum naar Nederlandse notatie
 */
export function formateerDatum(date: Date, isAllDay: boolean = false): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  };

  if (!isAllDay) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }

  return date.toLocaleDateString('nl-NL', options);
}

/**
 * Formatteert een datum naar korte Nederlandse notatie
 */
export function formateerKorteDatum(date: Date): string {
  return date.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Formatteert alleen de tijd
 */
export function formateerTijd(date: Date): string {
  return date.toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
