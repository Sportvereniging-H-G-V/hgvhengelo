/**
 * AllUnited API client voor het ophalen van lesrooster data
 * Gebaseerd op AllUnited B.V. RestFul API voor Selectie Wizard
 */

interface AccessToken {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

interface Query {
  id: string;
  name: string;
  description?: string;
}

interface QueryResult {
  data: any[];
  [key: string]: any;
}

/**
 * Haalt een authorization code op (stap 1)
 * Let op: Deze code is maar een paar seconden geldig!
 */
async function haalAuthorizationCode(
  apiUrl: string,
  clientId: string
): Promise<string | null> {
  try {
    const url = `${apiUrl}/authorize?response_type=code&client_id=${clientId}`;
    
    // Probeer eerst met redirect: 'manual' om de Location header te lezen
    let response = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
    });

    // Als er een redirect is (status 3xx), lees de Location header
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (location && location.includes('code=')) {
        try {
          const urlObj = new URL(location);
          const code = urlObj.searchParams.get('code');
          if (code) return code;
        } catch (e) {
          // Als location een relatieve URL is, probeer het te parsen
          const match = location.match(/code=([^&]+)/);
          if (match) return match[1];
        }
      }
    }

    // Als dat niet werkt, probeer redirect te volgen
    response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
    });

    // Check of de final URL een code bevat
    const finalUrl = response.url;
    if (finalUrl && finalUrl.includes('code=')) {
      try {
        const urlObj = new URL(finalUrl);
        const code = urlObj.searchParams.get('code');
        if (code) return code;
      } catch (e) {
        const match = finalUrl.match(/code=([^&]+)/);
        if (match) return match[1];
      }
    }

    // Als de response JSON is (sommige implementaties)
    if (response.headers.get('content-type')?.includes('application/json')) {
      const data = await response.json();
      return data.code || null;
    }

    console.error('Geen authorization code gevonden in response');
    return null;
  } catch (error) {
    console.error('Fout bij ophalen authorization code:', error);
    return null;
  }
}

/**
 * Genereert een access token (stap 2)
 */
async function genereerAccessToken(
  apiUrl: string,
  clientId: string,
  apiKey: string,
  section: string,
  code: string
): Promise<AccessToken | null> {
  try {
    const url = `${apiUrl}/generate_token`;
    
    // Basic Auth credentials
    const credentials = btoa(`${clientId}:${apiKey}`);
    
    const formData = new URLSearchParams();
    formData.append('grant_type', 'authorization_code');
    formData.append('code', code);
    formData.append('section', section);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      console.error(`Token generatie fout: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return null;
    }

    const tokenData: AccessToken = await response.json();
    return tokenData;
  } catch (error) {
    console.error('Fout bij genereren access token:', error);
    return null;
  }
}

/**
 * Haalt een access token op (combineert stap 1 en 2)
 */
async function haalAccessToken(
  apiUrl: string,
  clientId: string,
  apiKey: string,
  section: string
): Promise<string | null> {
  // Stap 1: Haal authorization code op
  const code = await haalAuthorizationCode(apiUrl, clientId);
  if (!code) {
    return null;
  }

  // Stap 2: Genereer access token
  const tokenData = await genereerAccessToken(apiUrl, clientId, apiKey, section, code);
  if (!tokenData) {
    return null;
  }

  return tokenData.access_token;
}

type RuntimeEnv = Record<string, string | undefined>;

function getVar(key: string, env?: RuntimeEnv): string | undefined {
  return (env?.[key] as string | undefined) || import.meta.env[key];
}

/**
 * Haalt lijst met beschikbare queries op (stap 3a)
 */
export async function haalQueries(env?: RuntimeEnv): Promise<Query[]> {
  const apiUrl = getVar('ALLUNITED_API_URL', env);
  const clientId = getVar('ALLUNITED_CLIENT_ID', env);
  const apiKey = getVar('ALLUNITED_API_KEY', env);
  const section = getVar('ALLUNITED_SECTION', env);

  if (!apiUrl || !clientId || !apiKey || !section) {
    console.warn('AllUnited API configuratie ontbreekt. Controleer je .env bestand.');
    return [];
  }

  try {
    const accessToken = await haalAccessToken(apiUrl, clientId, apiKey, section);
    if (!accessToken) {
      return [];
    }

    const url = `${apiUrl}/queries`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Queries ophalen fout: ${response.status} ${response.statusText}`);
      return [];
    }

    const queries: Query[] = await response.json();
    return queries;
  } catch (error) {
    console.error('Fout bij ophalen queries:', error);
    return [];
  }
}

/**
 * Haalt data uit een specifieke query op (stap 3b)
 */
export async function haalQueryResult(queryId: string, env?: RuntimeEnv): Promise<QueryResult | null> {
  const apiUrl = getVar('ALLUNITED_API_URL', env);
  const clientId = getVar('ALLUNITED_CLIENT_ID', env);
  const apiKey = getVar('ALLUNITED_API_KEY', env);
  const section = getVar('ALLUNITED_SECTION', env);

  if (!apiUrl || !clientId || !apiKey || !section) {
    const missing = [];
    if (!apiUrl) missing.push('ALLUNITED_API_URL');
    if (!clientId) missing.push('ALLUNITED_CLIENT_ID');
    if (!apiKey) missing.push('ALLUNITED_API_KEY');
    if (!section) missing.push('ALLUNITED_SECTION');
    console.warn(`AllUnited API configuratie ontbreekt: ${missing.join(', ')}. Controleer je .env bestand.`);
    return null;
  }

  if (!queryId) {
    console.warn('Query ID ontbreekt. Vul ALLUNITED_QUERY_ID in je .env bestand in.');
    return null;
  }

  try {
    console.log('Ophalen access token...');
    const accessToken = await haalAccessToken(apiUrl, clientId, apiKey, section);
    if (!accessToken) {
      console.error('Kon geen access token ophalen');
      return null;
    }
    console.log('Access token opgehaald');

    const url = `${apiUrl}/queryresult/${queryId}`;
    console.log(`Ophalen query result van: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Query result ophalen fout: ${response.status} ${response.statusText}`);
      console.error('Error details:', errorText);
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const result: QueryResult = await response.json();
    console.log(`Query result ontvangen: ${result.data ? result.data.length : 0} items`);
    return result;
  } catch (error: any) {
    console.error('Fout bij ophalen query result:', error);
    throw error; // Re-throw zodat de caller de error kan zien
  }
}
