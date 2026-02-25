/**
 * Kalender API client voor het ophalen van ICS kalender data
 * Haalt events op van een Nextcloud CalDAV public calendar
 */

import ICAL from 'ical.js';

/**
 * Cache voor kalender events
 * Bewaart data voor 24 uur (86400000 milliseconden)
 */
interface CalendarCache {
  events: CalendarEvent[];
  timestamp: number;
}

let kalenderCache: CalendarCache | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 uur in milliseconden

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
 * Gebruikt caching om de kalender niet bij elk bezoek op te halen (24 uur cache)
 */
export async function haalAankomendeEvents(limit: number = 5): Promise<CalendarEvent[]> {
  const calendarUrl = import.meta.env.CALENDAR_ICS_URL;

  if (!calendarUrl) {
    console.warn('Kalender URL ontbreekt. Voeg CALENDAR_ICS_URL toe aan je .env bestand.');
    return [];
  }

  // Controleer of we geldige gecachte data hebben
  if (kalenderCache && Date.now() - kalenderCache.timestamp < CACHE_DURATION) {
    console.log('Kalender events opgehaald uit cache');
    return filterUpcomingEvents(kalenderCache.events, limit);
  }

  const icsData = await fetchIcsData(calendarUrl);
  if (!icsData) {
    // Gebruik oude cache als fallback
    if (kalenderCache) {
      console.log('Gebruik oude kalender cache als fallback');
      return filterUpcomingEvents(kalenderCache.events, limit);
    }
    return [];
  }

  const allEvents = parseIcsData(icsData);

  kalenderCache = { events: allEvents, timestamp: Date.now() };
  console.log('Kalender events opgeslagen in cache (geldig voor 24 uur)');

  return filterUpcomingEvents(allEvents, limit);
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
