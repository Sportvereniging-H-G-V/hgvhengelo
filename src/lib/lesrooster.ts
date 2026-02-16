/**
 * Utility functies voor het ophalen van lesrooster data via de AllUnited API
 */

import { haalQueryResult } from './allunited-api';

export interface Les {
  id?: string;
  sport: string;
  tijd: string; // Format: "HH:MM" of "HH:MM - HH:MM"
  locatie: string;
  dag: string; // Maandag, Dinsdag, etc.
  leeftijd?: string;
  niveau?: string;
  docent?: string;
  [key: string]: any; // Voor extra velden uit de API
}

export interface LesroosterData {
  lessen: Les[];
  laatsteUpdate?: string;
}

/**
 * Cache voor lesrooster data
 * Bewaart data voor 2 uur (7200000 milliseconden)
 */
interface CacheEntry {
  data: LesroosterData;
  timestamp: number;
}

let lesroosterCache: CacheEntry | null = null;
const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 uur in milliseconden

/**
 * Controleert of de cache nog geldig is
 */
function isCacheValid(cache: CacheEntry | null): boolean {
  if (!cache) return false;
  const now = Date.now();
  const age = now - cache.timestamp;
  return age < CACHE_DURATION;
}

/**
 * Haalt lesrooster data op van de AllUnited API
 * Gebruikt caching om de API niet bij elk bezoek aan te roepen
 */
export async function haalLesroosterOp(): Promise<LesroosterData | null> {
  // Controleer eerst of we geldige gecachte data hebben
  if (isCacheValid(lesroosterCache)) {
    console.log('Lesrooster data opgehaald uit cache');
    return lesroosterCache!.data;
  }

  const queryId = import.meta.env.ALLUNITED_QUERY_ID;

  if (!queryId) {
    console.warn('AllUnited Query ID ontbreekt. Controleer je .env bestand.');
    return null;
  }

  try {
    console.log('Lesrooster data ophalen van API (cache is verlopen of niet beschikbaar)...');
    const queryResult = await haalQueryResult(queryId);
    
    if (!queryResult) {
      console.warn('Geen query result ontvangen van AllUnited API');
      // Als we oude cache hebben, gebruik die als fallback
      if (lesroosterCache) {
        console.log('Gebruik oude cache data als fallback');
        return lesroosterCache.data;
      }
      return null;
    }

    // Debug: log de ruwe data (alleen in development)
    if (import.meta.env.DEV) {
      console.log('AllUnited API Response:', JSON.stringify(queryResult, null, 2));
    }

    // Transformeer de AllUnited query result data naar onze interne structuur
    const transformed = transformAllUnitedData(queryResult);
    
    // Debug: log de getransformeerde data
    console.log('Getransformeerde lessen:', transformed.lessen.length);
    
    // Sla de data op in cache
    lesroosterCache = {
      data: transformed,
      timestamp: Date.now(),
    };
    
    console.log('Lesrooster data opgeslagen in cache (geldig voor 2 uur)');
    
    return transformed;
  } catch (error) {
    console.error('Fout bij ophalen lesrooster:', error);
    // Als we oude cache hebben, gebruik die als fallback
    if (lesroosterCache) {
      console.log('Gebruik oude cache data als fallback na error');
      return lesroosterCache.data;
    }
    return null;
  }
}

/**
 * Transformeert AllUnited API data naar onze interne structuur
 * Pas dit aan op basis van de werkelijke veldnamen in de Selectie Wizard
 * 
 * TIP: Bekijk /api/debug-lesrooster om de exacte veldnamen te zien!
 */
export function transformAllUnitedData(queryResult: any): LesroosterData {
  let lessen: Les[] = [];

  // AllUnited geeft data terug in een data array
  if (queryResult.data && Array.isArray(queryResult.data)) {
    lessen = queryResult.data.map((item: any) => {
      // Map de velden op basis van de werkelijke AllUnited API veldnamen:
      // - course: naam van de cursus/sport
      // - timefrom: starttijd (format: "HH:MM:SS")
      // - timeto: eindtijd (format: "HH:MM:SS")
      // - dayofweek_long: dag van de week (lowercase, bijv. "maandag")
      // - location: locatie
      // - coursecode: unieke code voor de cursus
      
      // Converteer tijd van "HH:MM:SS" naar "HH:MM - HH:MM" formaat
      const formatTime = (timeStr: string): string => {
        if (!timeStr) return '';
        // Haal alleen HH:MM eruit (verwijder seconden)
        return timeStr.substring(0, 5);
      };
      
      const timeFrom = formatTime(item.timefrom || '');
      const timeTo = formatTime(item.timeto || '');
      const tijd = timeFrom && timeTo ? `${timeFrom} - ${timeTo}` : timeFrom || timeTo || '';
      
      // Converteer dag van lowercase naar hoofdletter (bijv. "maandag" -> "Maandag")
      const capitalizeDay = (day: string): string => {
        if (!day) return '';
        return day.charAt(0).toUpperCase() + day.slice(1);
      };
      
      const dag = capitalizeDay(item.dayofweek_long || '');

      return {
        id: item.coursecode || item.id || item.ID,
        sport: item.course || '',
        tijd: tijd,
        locatie: item.location || '',
        dag: dag,
        leeftijd: undefined, // Niet beschikbaar in deze API
        niveau: undefined, // Niet beschikbaar in deze API
        docent: undefined, // Niet beschikbaar in deze API
        // Behoud alle andere velden voor flexibiliteit
        coursecode: item.coursecode,
        timefrom: item.timefrom,
        timeto: item.timeto,
        dayofweek_long: item.dayofweek_long,
      };
    }).filter((les: Les) => les.sport && les.tijd && les.locatie && les.dag); // Filter lege lessen eruit
  }

  return {
    lessen,
    laatsteUpdate: queryResult.updated_at || queryResult.UpdatedAt || new Date().toISOString(),
  };
}

/**
 * Groepeert lessen per dag
 */
export function groepeerLessenPerDag(lessen: Les[]): Record<string, Les[]> {
  const dagen: Record<string, Les[]> = {
    Maandag: [],
    Dinsdag: [],
    Woensdag: [],
    Donderdag: [],
    Vrijdag: [],
    Zaterdag: [],
    Zondag: [],
  };

  // Mapping van verschillende dag formaten naar standaard namen
  const dagMapping: Record<string, string> = {
    'maandag': 'Maandag',
    'Maandag': 'Maandag',
    'dinsdag': 'Dinsdag',
    'Dinsdag': 'Dinsdag',
    'woensdag': 'Woensdag',
    'Woensdag': 'Woensdag',
    'donderdag': 'Donderdag',
    'Donderdag': 'Donderdag',
    'vrijdag': 'Vrijdag',
    'Vrijdag': 'Vrijdag',
    'zaterdag': 'Zaterdag',
    'Zaterdag': 'Zaterdag',
    'zondag': 'Zondag',
    'Zondag': 'Zondag',
  };

  lessen.forEach((les) => {
    const dag = les.dag;
    if (dag) {
      // Normaliseer de dag naam
      const normalizedDag = dagMapping[dag.toLowerCase()] || dag;
      if (dagen[normalizedDag]) {
        dagen[normalizedDag].push(les);
      }
    }
  });

  // Sorteer lessen per dag op tijd
  Object.keys(dagen).forEach((dag) => {
    dagen[dag].sort((a, b) => {
      const tijdA = a.tijd.split('-')[0].trim();
      const tijdB = b.tijd.split('-')[0].trim();
      return tijdA.localeCompare(tijdB);
    });
  });

  return dagen;
}
