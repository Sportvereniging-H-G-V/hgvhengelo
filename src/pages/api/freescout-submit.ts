import type { APIRoute } from 'astro';
import { maakFreescoutConversation } from '../../lib/freescout-api';

export const prerender = false;

// Configuratie: Mailbox IDs per formulier type
const MAILBOX_IDS: Record<string, number> = {
  'wijziging': Number(import.meta.env.FREESCOUT_MAILBOX_WIJZIGING || 0),
  'opzegging': Number(import.meta.env.FREESCOUT_MAILBOX_OPZEGGING || 0),
  'contact': Number(import.meta.env.FREESCOUT_MAILBOX_CONTACT || 0),
  'kamp': Number(import.meta.env.FREESCOUT_MAILBOX_KAMP || 0),
  'kamp-teamleden': Number(import.meta.env.FREESCOUT_MAILBOX_KAMP_TEAMLIDEN || 0),
  'ict': Number(import.meta.env.FREESCOUT_MAILBOX_ICT || 0),
  'ck': Number(import.meta.env.FREESCOUT_MAILBOX_CK || 0),
  'kleding': Number(import.meta.env.FREESCOUT_MAILBOX_KLEDING || 0),
};

export const POST: APIRoute = async ({ request }) => {
  const response: any = {
    success: false,
    message: '',
    error: null,
  };

  try {
    // Lees request body als text eerst om lege body te detecteren
    const requestText = await request.text();

    if (!requestText || requestText.trim() === '') {
      response.error = 'Geen data ontvangen in request body';
      return new Response(JSON.stringify(response), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let body;
    try {
      body = JSON.parse(requestText);
    } catch (parseError) {
      response.error = 'Ongeldige JSON in request body';
      return new Response(JSON.stringify(response), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { formType, formData } = body;

    if (!formType) {
      response.error = 'Formulier type ontbreekt';
      return new Response(JSON.stringify(response), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('Ontvangen formulier data:', {
      formType,
      fields: Object.keys(formData),
      formData,
    });

    const mailboxId = MAILBOX_IDS[formType];
    if (!mailboxId || mailboxId === 0) {
      response.error = `Geen mailbox ID geconfigureerd voor formulier type: ${formType}`;
      return new Response(JSON.stringify(response), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Haal email en naam op uit formData (verschillende veldnamen per formulier)
    const email = formData.email || formData.betaalrelatie_email || formData['email-aanvrager'] || '';
    const phone = formData.phone || formData.telefoon || formData.betaalrelatie_telefoon || '';

    // Naam mapping: verschillende formulieren gebruiken verschillende velden
    let firstName = formData.voornaam || formData.roepnaam || formData.betaalrelatie_voornaam || formData['naam-voornaam'] || '';
    let lastName = formData.achternaam || formData.betaalrelatie_achternaam || formData['naam-achternaam'] || '';

    // Contactformulier gebruikt een enkel "name" veld - split het indien mogelijk
    if (!firstName && !lastName && formData.name) {
      const nameParts = String(formData.name).trim().split(' ');
      if (nameParts.length > 1) {
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ');
      } else {
        // Alleen een naam opgegeven, gebruik als lastName
        lastName = nameParts[0];
      }
    }

    console.log('Gemapte velden:', {
      email,
      firstName,
      lastName,
      phone,
    });

    // Maak subject op basis van formulier type
    const formNames: Record<string, string> = {
      'wijziging': 'Wijzigingsformulier',
      'opzegging': 'Opzeggingsformulier',
      'contact': 'Contactformulier',
      'kamp': 'Jeugdkamp aanmelding',
      'kamp-teamleden': 'Teamlid kamp aanmelding',
      'ict': 'ICT Aanvraag',
      'ck': 'CK Aanmelding',
      'kleding': 'Kledingbestelling',
    };

    const formName = formNames[formType] || 'Formulier';
    const subject = `Nieuwe inzending vanaf ${formName}`;

    // Maak conversation aan in Freescout (formType voor consistente e-mailopmaak)
    const conversation = await maakFreescoutConversation({
      type: 'email',
      subject: subject,
      mailboxId: mailboxId,
      formType: formType,
      customer: {
        email: email,
        firstName: firstName,
        lastName: lastName,
        phone: phone,
      },
      body: formData,
    });

    response.success = true;
    response.message = 'Formulier succesvol verzonden!';
    if (conversation.id) response.conversationId = conversation.id;
    if (conversation.number) response.conversationNumber = conversation.number;

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Fout bij verzenden naar Freescout:', error);
    response.error = error.message || 'Er is een fout opgetreden bij het verzenden van het formulier.';

    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// Andere methodes afwijzen
export const ALL: APIRoute = async () => {
  return new Response(JSON.stringify({ error: 'Alleen POST requests zijn toegestaan' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
};
