export interface ContributieRate {
  duration: string;
  junior: string;
  senior: string;
}

export interface SpecialRate {
  sport: string;
  duration: string;
  junior: string | null;
  senior: string | null;
}

export const regularRates: ContributieRate[] = [
  { duration: '1 uur', junior: '€13,80', senior: '€17,60' },
  { duration: '1,5 uur', junior: '€20,70', senior: '€26,40' },
  { duration: '2 uur', junior: '€27,60', senior: '€35,20' },
];

export const specialRates: SpecialRate[] = [
  { sport: 'Ouder & Kind Gym', duration: '45 min', junior: '€17,60', senior: null },
  { sport: 'Passend Sporten', duration: '45 min', junior: '€13,80', senior: '€17,60' },
  { sport: 'Rhönradturnen', duration: '1,5 uur', junior: '€25,00', senior: '€28,30' },
  { sport: 'Volleybal / Zaalvoetbal', duration: '75 min', junior: null, senior: '€18,90' },
];

export const additionalInfo = {
  registrationFee: {
    junior: '€7,75',
    senior: '€8,50',
    description: 'Eenmalig inschrijfgeld',
  },
  kngufee: {
    junior: '€2,50',
    senior: '€3,10',
    description: 'KNGU lidmaatschap per maand (inbegrepen)',
  },
  multiSportDiscount: '50%',
  billing: 'Maandelijkse automatische incasso',
  cancellationDeadlines: [
    '31 maart',
    '30 juni',
    '30 september',
    '31 december',
  ],
  inactiveMembership: '€15 per half jaar',
  period: 'April 2025 - Maart 2026',
};
