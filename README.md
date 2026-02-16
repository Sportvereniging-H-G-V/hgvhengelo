# HGV Hengelo Website

Officiële website van HGV Hengelo, een gymnastiek- en sportvereniging in Hengelo. De site biedt een overzicht van het sportaanbod, een actueel lesrooster en formulieren voor inschrijving, wijzigingen en opzeggingen.

Live: [hgvhengelo.nl](https://hgvhengelo.nl)

## Gebouwd met

- [Astro 5](https://astro.build) — static site generator met hybride rendering
- [Tailwind CSS 4](https://tailwindcss.com) — utility-first CSS framework
- [TypeScript](https://www.typescriptlang.org)
- [Lucide](https://lucide.dev) — iconenbibliotheek
- [AllUnited API](https://www.allunited.nl) — lesroosterdata (OAuth2)
- [Freescout](https://freescout.net) — formulierinzendingen als supporttickets

## Aan de slag

### Vereisten

- Node.js (LTS aanbevolen)
- npm

### Installatie

```bash
npm install
```

### Omgevingsvariabelen

Kopieer `.env.example` naar `.env` en vul de waarden in:

```bash
cp .env.example .env
```

De volgende variabelen zijn vereist voor de externe integraties:

| Variabele | Beschrijving |
|---|---|
| `ALLUNITED_API_URL` | Base URL van de AllUnited API |
| `ALLUNITED_CLIENT_ID` | Client ID voor OAuth2 |
| `ALLUNITED_API_KEY` | API key voor authenticatie |
| `ALLUNITED_SECTION` | Sectie-identifier (bijv. `HGV`) |
| `ALLUNITED_QUERY_ID` | Query ID voor het lesrooster |
| `FREESCOUT_API_URL` | Base URL van de Freescout-installatie |
| `FREESCOUT_API_KEY` | API key voor Freescout |
| `FREESCOUT_MAILBOX_*` | Mailbox IDs per formuliertype |

De site bouwt ook zonder deze variabelen; de lesroosterpagina en formulieren vallen dan terug op een foutmelding.

### Ontwikkelserver starten

```bash
npm run dev
```

De site is beschikbaar op `http://localhost:4321`.

## Commando's

| Commando | Actie |
|---|---|
| `npm run dev` | Ontwikkelserver starten op `localhost:4321` |
| `npm run build` | Productiesite bouwen naar `./dist/` |
| `npm run preview` | Productie-build lokaal bekijken |

## Projectstructuur

```
src/
  components/     — Herbruikbare Astro-componenten
  content/        — Markdown content (sporten, pagina's)
  data/           — Navigatiestructuur en statische data
  layouts/        — Paginalayouts (BaseLayout)
  lib/            — Integratieclients (AllUnited, Freescout)
  pages/          — Bestandsgebaseerde routing
    api/          — Server-side API routes
  styles/         — Globale CSS en Tailwind-thema
public/           — Statische assets (afbeeldingen, favicon)
```

## Deployment

De site genereert statische HTML via `npm run build`. De output staat in `./dist/` en kan worden gehost op elke statische hostingomgeving. De Node.js-adapter is geconfigureerd voor standalone-modus, zodat de API-routes (lesrooster, formulieren) ook in een Node.js-serveromgeving kunnen draaien.
