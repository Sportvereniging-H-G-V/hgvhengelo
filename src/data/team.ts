export interface TeamMember {
  name: string;
  role: string;
  email?: string;
  phone?: string;
  image?: string;
}

export const bestuur: TeamMember[] = [
  {
    name: 'Mirjam Pierik',
    role: 'Voorzitter',
    email: 'voorzitter@hgvhengelo.nl',
    phone: '06-41665238',
  },
  {
    name: 'Vacant',
    role: 'Secretaris',
    email: 'secretariaat@hgvhengelo.nl',
    phone: '06-43118346',
  },
  {
    name: 'Mariël Bakema',
    role: 'Penningmeester',
    email: 'penningmeester@hgvhengelo.nl',
  },
  {
    name: 'Ruben Rikkerink',
    role: 'PR en Communicatie',
    email: 'pr@hgvhengelo.nl',
  },
  {
    name: 'Ayleen Smink & Tosca Mollink',
    role: 'Evenementen',
    email: 'evenementen@hgvhengelo.nl',
  },
  {
    name: 'Tosca & Astrid',
    role: 'Ledenadministratie',
    email: 'ledenadministratie@hgvhengelo.nl',
    phone: '06-43118346',
  },
  {
    name: 'Errol Herder',
    role: 'Technisch Bestuurslid',
    phone: '06-17020877',
  },
];

export const vertrouwenscontactpersonen: TeamMember[] = [
  {
    name: 'Chantal Steggink',
    role: 'Vertrouwenscontactpersoon',
    email: 'c.d.degraaf@hotmail.com',
    phone: '06-14036464',
  },
  {
    name: 'Alex Jonkhart',
    role: 'Vertrouwenscontactpersoon',
    email: 'a.jonkhart@live.nl',
    phone: '06-34512728',
  },
];

export const externeVertrouwenspersoon: TeamMember = {
  name: 'Henry Wenting',
  role: 'Externe Vertrouwenspersoon',
  email: 'ha.wenting@gmail.com',
  phone: '06-22597244',
};
