/**
 * Freescout API client voor het aanmaken van tickets/conversations
 * Documentatie: https://freescout.net/docs/api/
 */

interface FreescoutConversation {
  type: 'email' | 'phone' | 'chat';
  subject: string;
  customer: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
  mailboxId: number;
  body: string | Record<string, any>;
  formType?: string;
  attachments?: any[];
  customFields?: Record<string, any>;
}

interface FreescoutResponse {
  id?: number;
  number?: string;
  error?: string;
  message?: string;
}

/**
 * Maakt een nieuwe conversation aan in Freescout
 */
export async function maakFreescoutConversation(
  conversation: FreescoutConversation
): Promise<FreescoutResponse> {
  const apiUrl = import.meta.env.FREESCOUT_API_URL;
  const apiKey = import.meta.env.FREESCOUT_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error('Freescout API configuratie ontbreekt. Controleer FREESCOUT_API_URL en FREESCOUT_API_KEY in je .env bestand.');
  }

  if (!conversation.mailboxId) {
    throw new Error('Mailbox ID is verplicht voor het aanmaken van een conversation.');
  }

  // Valideer verplichte customer velden
  if (!conversation.customer.email) {
    throw new Error('Customer email is verplicht voor het aanmaken van een conversation.');
  }

  try {
    // Formatteer de body als HTML (zelfde opmaak als contactformulier voor alle formulieren)
    const htmlBody = formatFormDataAsHTML(conversation.body, conversation.formType);

    // Maak de payload voor Freescout API
    const payload = {
      type: conversation.type || 'email',
      subject: conversation.subject,
      mailboxId: conversation.mailboxId,
      imported: true,
      customer: {
        email: conversation.customer.email,
      },
      threads: [
        {
          type: 'customer',
          text: htmlBody,
          customer: {
            email: conversation.customer.email,
            ...(conversation.customer.firstName && { firstName: conversation.customer.firstName }),
            ...(conversation.customer.lastName && { lastName: conversation.customer.lastName }),
            ...(conversation.customer.phone && { phone: conversation.customer.phone }),
          },
        },
      ],
      ...(conversation.customFields && { customFields: conversation.customFields }),
    };

    console.log('Freescout API Request:', {
      url: `${apiUrl}/api/conversations`,
      mailboxId: payload.mailboxId,
      customerEmail: payload.customer.email,
      subject: payload.subject,
    });

    const response = await fetch(`${apiUrl}/api/conversations`, {
      method: 'POST',
      headers: {
        'X-FreeScout-API-Key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('Freescout API Response Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Freescout API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });

      let errorMessage = `Freescout API fout: ${response.status} ${response.statusText}`;

      try {
        const errorData = JSON.parse(errorText);
        console.error('Parsed error data:', errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    // Haal response text op en parse alleen als er inhoud is
    const responseText = await response.text();

    if (!responseText || responseText.trim() === '') {
      // Lege response is OK bij sommige API's - return success zonder data
      return { id: undefined, number: undefined };
    }

    try {
      const result: FreescoutResponse = JSON.parse(responseText);
      return result;
    } catch {
      // Als parsing faalt maar response was OK, beschouw het als succes
      console.warn('Freescout response kon niet geparsed worden, maar request was succesvol');
      return { id: undefined, number: undefined };
    }
  } catch (error: any) {
    console.error('Fout bij aanmaken Freescout conversation:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      cause: error.cause,
    });
    throw error;
  }
}

/**
 * Secties en veldvolgorde per formtype – zelfde e-mailopmaak als contactformulier
 * (header, gestructureerde inhoud, footer)
 */
const FORM_SECTIONS: Record<string, Array<{ title: string; keys: string[] }>> = {
  contact: [
    { title: 'Contactgegevens', keys: ['name', 'email', 'phone'] },
    { title: 'Bericht', keys: ['subject', 'message'] },
  ],
  kamp: [
    { title: 'Persoonsgegevens', keys: ['voornaam', 'achternaam', 'geboortedatum', 'noodcontact1', 'noodcontact2', 'email'] },
    { title: 'Extra informatie', keys: ['medicijnen'] },
    { title: 'Vervoer', keys: ['vervoer', 'auto-plekken-nummer', 'opmerkingen'] },
    { title: 'Overige', keys: ['toestemming', 'handtekening'] },
  ],
  'kamp-teamleden': [
    { title: 'Persoonsgegevens', keys: ['voornaam', 'achternaam', 'email', 'noodcontact1', 'noodcontact2', 'allergieen', 'lessen'] },
    { title: 'Vervoer', keys: ['vervoer', 'carpool-plekken-nummer'] },
    { title: 'Overige', keys: ['handtekening'] },
  ],
  ck: [
    { title: 'Persoonsgegevens', keys: ['voornaam', 'achternaam', 'email', 'noodcontact'] },
    { title: 'Lesinformatie', keys: ['discipline', 'lesdag', 'lestijden', 'leslocatie', 'leiding', 'opmerkingen'] },
    { title: 'Overige', keys: ['handtekening'] },
  ],
  ict: [
    { title: 'Algemene informatie', keys: ['aanvraagtype', 'naam-voornaam', 'naam-achternaam', 'email-aanvrager', 'instemming'] },
    { title: 'Aanvraagdetails', keys: ['naam-gebruiker', 'privé-email', 'toegang-cloud', 'huidige-toegang', 'gewenste-wijziging', '2fa-reset', 'url', 'omschrijving', 'titel', 'inhoud', 'menu-zichtbaar', 'cloud-email', 'mailboxen', 'wijziging-type', 'mailbox-toevoegen', 'mailbox-verwijderen', 'gewenst-email', 'doel-mailbox', 'gekoppeld-gebruikers', 'gebruikers-lijst', 'emailadressen', 'probleem-type', 'probleem-omschrijving', 'datum', 'tijd', 'foutmelding', 'type', 'gebruiker', 'serienummer', 'in-gebruik', 'waarom-niet', 'email-gebruiker', 'rechten-functie', 'huidige-rol', 'nieuwe-rol', 'toelichting', 'waar-verwijderen', 'stopdatum', 'bewaren', 'wat-bewaren'] },
  ],
  wijziging: [],
  opzegging: [],
  kleding: [
    { title: 'Bestelling', keys: ['pak', 'hotpants', 'naamBroek', 'schrunchie', 'aanpassing'] },
    { title: 'Gegevens', keys: ['voornaam', 'achternaam', 'email', 'straat', 'postcode', 'plaats', 'verzending'] },
    { title: 'Totaal', keys: ['subtotaal', 'totaal'] },
  ],
};

/** Bouwt één tabelrij in dezelfde stijl als het contactformulier */
function buildTableRow(key: string, value: string, isEven: boolean): string {
  const label = formatLabel(key);
  const bgColor = isEven ? '#f9fafb' : 'white';
  return (
    '<tr style="background-color:' + bgColor + ';">' +
    '<td style="padding:16px 20px;font-weight:600;width:35%;vertical-align:top;color:#1E40AF;border-bottom:1px solid #e5e7eb;">' + escapeHtml(label) + '</td>' +
    '<td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;"><div style="color:#374151;white-space:pre-wrap;">' + escapeHtml(value) + '</div></td>' +
    '</tr>'
  );
}

/**
 * Formatteert formulier data als HTML voor de conversation body.
 * Zelfde opmaak voor alle formulieren: header, gestructureerde tabel, footer.
 */
function formatFormDataAsHTML(data: string | Record<string, any>, formType?: string): string {
  let html = '<div style="font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,\'Helvetica Neue\',Arial,sans-serif;line-height:1.6;color:#333;max-width:800px;">';

  // Header met HGV branding (zelfde als contactformulier)
  html += '<div style="background:linear-gradient(135deg,#1E40AF 0%,#0891B2 100%);padding:20px;border-radius:8px 8px 0 0;margin-bottom:0;">';
  html += '<h2 style="margin:0;color:white;font-size:20px;font-weight:600;">📋 Nieuwe Formulier Inzending</h2>';
  html += '<p style="margin:5px 0 0 0;color:rgba(255,255,255,0.9);font-size:14px;">HGV Hengelo</p>';
  html += '</div>';

  if (typeof data === 'string') {
    html += '<div style="background:#f9fafb;padding:20px;border-radius:0 0 8px 8px;">';
    html += '<div style="margin:0;white-space:pre-wrap;">' + escapeHtml(data) + '</div>';
    html += '</div>';
  } else if (typeof data === 'object') {
    const dataObj = data as Record<string, any>;
    const sections = formType ? FORM_SECTIONS[formType] : null;

    html += '<div style="background:white;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;overflow:hidden;">';

    if (sections && sections.length > 0) {
      let isEven = false;
      const renderedKeys = new Set<string>();
      for (const section of sections) {
        const rows: string[] = [];
        for (const key of section.keys) {
          const value = dataObj[key];
          if (value === null || value === undefined || value === '') continue;
          const displayValue = Array.isArray(value) ? value.join(', ') : String(value);
          rows.push(buildTableRow(key, displayValue, isEven));
          isEven = !isEven;
          renderedKeys.add(key);
        }
        if (rows.length > 0) {
          html += '<div style="padding:12px 20px 0 20px;font-size:13px;font-weight:600;color:#1E40AF;">' + escapeHtml(section.title) + '</div>';
          html += '<table style="width:100%;border-collapse:collapse;margin:0;">';
          html += '<tbody>' + rows.join('') + '</tbody></table>';
        }
      }
      // Velden die niet in secties staan (bijv. dynamische ICT-velden)
      const allSectionKeys = new Set(sections.flatMap(s => s.keys));
      const remainingEntries = Object.entries(dataObj).filter(([k, v]) => !allSectionKeys.has(k) && v != null && v !== '');
      if (remainingEntries.length > 0) {
        html += '<div style="padding:12px 20px 0 20px;font-size:13px;font-weight:600;color:#1E40AF;">Overige</div>';
        html += '<table style="width:100%;border-collapse:collapse;margin:0;">';
        html += '<tbody>';
        for (const [key, value] of remainingEntries) {
          const displayValue = Array.isArray(value) ? value.join(', ') : String(value);
          html += buildTableRow(key, displayValue, isEven);
          isEven = !isEven;
        }
        html += '</tbody></table>';
      }
    } else {
      // Geen formType of onbekend:zelfde tabelopmaak, alle velden in volgorde
      html += '<table style="width:100%;border-collapse:collapse;margin:0;">';
      html += '<tbody>';
      let isEven = false;
      for (const [key, value] of Object.entries(dataObj)) {
        if (value === null || value === undefined || value === '') continue;
        const displayValue = Array.isArray(value) ? value.join(', ') : String(value);
        html += buildTableRow(key, displayValue, isEven);
        isEven = !isEven;
      }
      html += '</tbody></table>';
    }

    html += '</div>';
  }

  // Footer (zelfde als contactformulier)
  html += '<div style="margin-top:20px;padding:16px;background:#f9fafb;border-radius:8px;font-size:12px;color:#6b7280;text-align:center;">';
  html += '<p style="margin:0;">✉️ Deze inzending kwam binnen via het formulier op <strong>hgvhengelo.nl</strong></p>';
  html += '</div>';

  html += '</div>';
  return html;
}

/**
 * Nederlandse labels voor formuliervelden (alle formulieren behalve contact)
 * Contactformulier gebruikt name, email, phone, subject, message en ziet er al goed uit.
 */
const LABEL_MAP: Record<string, string> = {
  // Algemeen / persoonsgegevens
  name: 'Naam',
  email: 'E-mailadres',
  phone: 'Telefoonnummer',
  subject: 'Onderwerp',
  message: 'Bericht',
  voornaam: 'Voornaam',
  achternaam: 'Achternaam',
  geboortedatum: 'Geboortedatum',
  handtekening: 'Handtekening',
  toestemming: 'Toestemming',
  opmerkingen: 'Opmerkingen',
  telefoon: 'Telefoonnummer',
  // Kamp
  noodcontact1: 'Noodcontact 1',
  noodcontact2: 'Noodcontact 2',
  medicijnen: 'Medicijnen / diëten / allergieën',
  vervoer: 'Vervoer',
  'auto-plekken-nummer': 'Aantal plekken in auto (excl. bestuurder)',
  // Kamp teamleden
  allergieen: 'Allergieën',
  lessen: 'Lessen',
  'carpool-plekken-nummer': 'Aantal carpoolplekken',
  // CK (clubkampioenschappen)
  noodcontact: 'Noodcontact',
  discipline: 'Discipline',
  lesdag: 'Lesdag',
  lestijden: 'Lestijden',
  leslocatie: 'Leslocatie',
  leiding: 'Leiding van de les',
  // Kleding
  pak: 'Turnpakje',
  hotpants: 'Hotpants',
  naamBroek: 'Naam op broek',
  schrunchie: 'Schrunchie',
  aanpassing: 'Aanpassing / opdruk',
  straat: 'Straat',
  plaats: 'Plaats',
  postcode: 'Postcode',
  verzending: 'Verzending',
  subtotaal: 'Subtotaal',
  totaal: 'Totaal',
  // ICT – algemeen
  aanvraagtype: 'Aanvraagtype',
  'naam-voornaam': 'Voornaam',
  'naam-achternaam': 'Achternaam',
  'email-aanvrager': 'E-mailadres aanvrager',
  instemming: 'Instemming',
  // ICT – cloud
  'naam-gebruiker': 'Naam gebruiker',
  'privé-email': 'Privé e-mailadres gebruiker',
  'toegang-cloud': 'Toegang H.G.V. Cloud (commissies/mappen)',
  'huidige-toegang': 'Huidige toegang',
  'gewenste-wijziging': 'Gewenste wijziging',
  '2fa-reset': '2FA resetten?',
  // ICT – website
  url: 'URL',
  omschrijving: 'Omschrijving',
  titel: 'Titel',
  inhoud: 'Inhoud',
  'menu-zichtbaar': 'Zichtbaar in menu?',
  // ICT – e-mail / FreeScout
  'cloud-email': 'H.G.V. Cloud e-mailadres',
  mailboxen: 'Mailbox(en)',
  'wijziging-type': 'Type wijziging',
  'mailbox-toevoegen': 'Mailbox(en) toevoegen',
  'mailbox-verwijderen': 'Mailbox(en) verwijderen',
  'gewenst-email': 'Gewenst e-mailadres',
  'doel-mailbox': 'Doel van de mailbox',
  'gekoppeld-gebruikers': 'Gekoppeld aan gebruikers?',
  'gebruikers-lijst': 'Gebruikers toevoegen',
  // ICT – e-mailproblemen
  emailadressen: 'E-mailadres(sen)',
  'probleem-type': 'Type probleem',
  'probleem-omschrijving': 'Omschrijving probleem',
  datum: 'Datum',
  tijd: 'Tijd',
  foutmelding: 'Foutmelding',
  // ICT – overig
  type: 'Type',
  gebruiker: 'Gebruiker',
  serienummer: 'Serienummer / labelnummer',
  'in-gebruik': 'Laptop in gebruik?',
  'waarom-niet': 'Waarom niet?',
  'email-gebruiker': 'E-mailadres gebruiker',
  'rechten-functie': 'Rechten en functie',
  'huidige-rol': 'Huidige rol',
  'nieuwe-rol': 'Nieuwe rol / rechten',
  toelichting: 'Toelichting',
  'waar-verwijderen': 'Waar account verwijderen?',
  stopdatum: 'Stopdatum',
  bewaren: 'Iets bewaren vóór verwijdering?',
  'wat-bewaren': 'Wat bewaren?',
};

/**
 * Formatteert een veldnaam naar een leesbaar label
 */
function formatLabel(key: string): string {
  if (LABEL_MAP[key]) {
    return LABEL_MAP[key];
  }
  // Vervang underscores en hyphens, camelCase naar leesbare tekst
  return key
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Escaped HTML speciale karakters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
