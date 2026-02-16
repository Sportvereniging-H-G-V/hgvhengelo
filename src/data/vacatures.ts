export interface VacatureSection {
  title: string;
  content?: string;
  items?: string[];
}

export interface Vacature {
  id: string;
  title: string;
  category: string;
  hours: string;
  image: string;
  shortDescription: string;
  description: VacatureSection[];
  requirements: string[];
  benefits: string[];
  compensation: string;
  emailSubject: string;
}

export const vacatures: Vacature[] = [
  {
    id: 'secretaris',
    title: 'Secretaris (Vrijwilliger)',
    category: 'Bestuur',
    hours: '1-2 uur per week',
    image: 'https://hgvhengelo.nl/wp-content/uploads/2025/07/communication-connection-message-networking-2.jpg',
    shortDescription: 'Onmisbare schakel binnen het bestuur. Zorg dat communicatie, administratie en planning soepel verlopen.',
    description: [
      {
        title: 'Wat ga je doen?',
        content: 'Als secretaris ben je een onmisbare schakel binnen het bestuur van H.G.V. Je zorgt dat communicatie, administratie en planning soepel verlopen. Je bent gemiddeld 1 tot 2 uur per week bezig met:',
      },
      {
        title: 'Bestuurswerk:',
        items: [
          'Voorbereiden en notuleren van de maandelijkse bestuursvergadering',
          'Voorbereiden van agenda, notulen en het jaarverslag voor de jaarvergadering',
        ],
      },
      {
        title: 'Communicatie en administratie:',
        items: [
          'Beantwoorden van e-mails, telefoontjes en WhatsApp-berichten',
          'Verzenden van brieven aan leden (per mail)',
          'Uploaden van contracten en diploma\'s',
          'Aanvragen en bijhouden van \'lief en leed\'-momenten',
        ],
      },
      {
        title: 'Contacten en organisatie:',
        items: [
          'Aanspreekpunt voor de gemeente (gebreken en schoonmaak gymzalen)',
          'Reserveren van gymzalen',
          'Organiseren van EHBO-cursussen voor het team',
          'Bestellen van H.G.V.-polo\'s',
          'Bijhouden van verjaardagenlijst',
        ],
      },
    ],
    requirements: [
      'Je bent betrouwbaar en kunt gestructureerd werken',
      'Je hebt plezier in communiceren en administreren',
      'Je bent gemiddeld 1 à 2 uur per week beschikbaar',
      'Ervaring met eenvoudige digitale systemen (bijv. e-mail, Word/Google Docs) is handig',
    ],
    benefits: [
      'Een centrale en waardevolle rol in een actieve sportvereniging',
      'Ondersteuning van een betrokken bestuursteam',
      'Ruimte om je taken flexibel in te delen of te verdelen',
      'De kans om je bestuurlijke of organisatorische ervaring uit te breiden',
      'Gratis EHBO-cursus voor vrijwilligers',
      'Veel waardering en een gezellige verenigingssfeer!',
    ],
    compensation: 'Voor deze vrijwilligersfunctie is op dit moment geen financiële vergoeding van toepassing.',
    emailSubject: 'Interesse in functie Secretaris',
  },
  {
    id: 'administratief-ondersteuner',
    title: 'Administratief Ondersteuner (Vrijwilliger)',
    category: 'Bestuur',
    hours: 'Flexibel',
    image: 'https://hgvhengelo.nl/wp-content/uploads/2025/07/communication-connection-message-networking-2.jpg',
    shortDescription: 'Ondersteun het bestuur bij financiële en secretariële taken. Houd de administratie op orde.',
    description: [
      {
        title: 'Wat ga je doen?',
        content: 'Als administratief ondersteuner zorg je samen met het bestuur dat de administratie van H.G.V. goed op orde is. Je ondersteunt zowel bij financiële als secretariële taken. Denk hierbij aan het verwerken en ordenen van documenten, het bijhouden van overzichten, het af en toe ondersteunen bij inkomende en uitgaande mail, en het controleren en verwerken van basisgegevens (zoals facturen of declaraties).',
      },
      {
        title: '',
        content: 'Je werkt nauw samen met de penningmeester en de secretaris en springt waar nodig bij, zodat de lopende zaken binnen het bestuur en de vereniging soepel blijven verlopen.',
      },
    ],
    requirements: [
      'Iemand die nauwkeurig en betrouwbaar is',
      'Een gestructureerde manier van werken en oog voor overzicht',
      'Je vindt het leuk om het bestuur te ondersteunen en samen te werken met vrijwilligers',
      'Basiskennis van bijvoorbeeld Excel of een administratiesysteem is handig, maar geen vereiste',
    ],
    benefits: [
      'Een gezellige en betrokken vereniging waar je écht iets kunt betekenen',
      'Ruimte om te leren en je te ontwikkelen in administratieve (en eventueel financiële) taken binnen een vereniging',
      'De kans om samen te werken met een enthousiast bestuur en andere vrijwilligers',
      'Mogelijkheid om kosteloos een EHBO-diploma te behalen als vrijwilliger',
    ],
    compensation: 'Voor deze functie is geen vrijwilligersvergoeding van toepassing.',
    emailSubject: 'Interesse in functie Administratief Ondersteuner',
  },
  {
    id: 'chauffeur',
    title: 'Chauffeur (BE-rijbewijs) – Vrijwilliger',
    category: 'Logistiek',
    hours: 'Flexibel',
    image: 'https://hgvhengelo.nl/wp-content/uploads/2025/04/image2.png',
    shortDescription: 'Help bij het vervoeren van materialen naar evenementen en wedstrijden. Rijd met onze aanhanger.',
    description: [
      {
        title: 'Wat ga je doen?',
        content: 'Als chauffeur help je bij het vervoeren van materialen en/of toestellen naar evenementen, wedstrijden of uitvoeringen. Je rijdt met onze aanhanger (of een busje met aanhanger), en zorgt ervoor dat alles veilig en op tijd op locatie is. Je werkt samen met andere vrijwilligers om de logistiek rond activiteiten soepel te laten verlopen.',
      },
    ],
    requirements: [
      'Je bent in het bezit van een geldig BE-rijbewijs',
      'Je bent verantwoordelijk, rijdt veilig en zorgvuldig',
      'Je kunt af en toe flexibel inzetbaar zijn, vooral in weekenden of bij grotere evenementen',
      'Je bent een teamspeler die graag een steentje bijdraagt',
    ],
    benefits: [
      'Een gezellige vereniging waar je deel uitmaakt van een enthousiast team',
      'Waardering voor je inzet en een belangrijke rol bij het mogelijk maken van sportieve activiteiten',
      'Gratis EHBO-diploma voor vrijwilligers',
    ],
    compensation: 'Voor deze functie is geen vrijwilligersvergoeding van toepassing.',
    emailSubject: 'Interesse in functie Chauffeur',
  },
  {
    id: 'leiding',
    title: 'Leiding (18+)',
    category: 'Lesgeven',
    hours: 'Wekelijks',
    image: 'https://hgvhengelo.nl/wp-content/uploads/2024/10/Leiding-gezocht-scaled.jpg',
    shortDescription: 'Verzorg wekelijks sportlessen en begeleid sporters in hun ontwikkeling binnen een leuke omgeving.',
    description: [
      {
        title: 'Wat ga je doen?',
        items: [
          'Je verzorgt wekelijks sportlessen binnen de vereniging',
          'Je kiest een doelgroep die bij jou past en begeleidt sporters in hun ontwikkeling',
          'Je zorgt voor een veilige, leuke en inspirerende lesomgeving',
          'Daarnaast help je mee bij het organiseren van sportieve activiteiten en evenementen',
        ],
      },
    ],
    requirements: [
      'Je bent minimaal 18 jaar oud',
      'Affiniteit met sport en plezier in het werken met groepen',
      'Ervaring en diploma\'s zijn een pre, maar geen vereiste',
      'Je bent wekelijks beschikbaar voor een vaste les',
    ],
    benefits: [
      'Diverse opleidingsmogelijkheden, waaronder KNGU-cursussen, waarbij je slechts 25% van de kosten betaalt',
      'Gratis EHBO-diploma voor alle vrijwilligers',
      'Gratis deelname aan je eerste twee lessen',
      '50% korting op de contributie voor de volgende lessen',
      'Een gezellige en hechte sfeer waarin samenwerking en plezier centraal staan',
    ],
    compensation: 'Een vrijwilligersvergoeding is bespreekbaar en afhankelijk van je ervaring en behaalde diploma\'s.',
    emailSubject: 'Interesse in functie Leiding',
  },
  {
    id: 'assistent',
    title: 'Assistenten (12+)',
    category: 'Ondersteuning',
    hours: 'Wekelijks',
    image: 'https://hgvhengelo.nl/wp-content/uploads/2024/10/Assistent-gezocht-scaled-e1751703837427.jpg',
    shortDescription: 'Ondersteun de leiding tijdens sportlessen en help bij evenementen. Ontwikkel jezelf als assistent.',
    description: [
      {
        title: 'Wat ga je doen?',
        items: [
          'Je ondersteunt de leiding tijdens de grotere sport- en gymlessen',
          'Je helpt bij de organisatie van evenementen en activiteiten',
          'Je zorgt voor een goede sfeer en helpt de lessen soepel te laten verlopen',
          'Je assisteert wekelijks bij een vaste les',
        ],
      },
    ],
    requirements: [
      'Je bent 12 jaar of ouder en hebt interesse in sport',
      'Je vindt het leuk om anderen te helpen en samen te werken',
      'Je bent bereid om je verder te ontwikkelen als assistent',
      'Je bent wekelijks beschikbaar om een vaste les te assisteren',
    ],
    benefits: [
      'Deelname aan de H.G.V. Academie, een wekelijkse les op zondag van 10:45 tot 11:45 uur',
      'Diverse opleidingsmogelijkheden, waaronder KNGU-cursussen, waarbij je slechts 25% van de kosten betaalt',
      'Gratis EHBO-diploma voor alle vrijwilligers',
      'Gratis deelname aan je eerste twee lessen',
      '50% korting op de contributie voor de volgende lessen',
      'Een gezellige en hechte sfeer waarin je nieuwe vrienden kunt maken en jezelf kunt ontwikkelen',
    ],
    compensation: 'Een vrijwilligersvergoeding kan bespreekbaar zijn, afhankelijk van de lessen waar je assisteert, je ervaring en eventuele diploma\'s.',
    emailSubject: 'Interesse in functie Assistent',
  },
];
