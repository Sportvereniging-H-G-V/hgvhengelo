export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export const navigation: NavItem[] = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'Ons Aanbod',
    href: '/ons-aanbod',
    children: [
      { label: 'Wekelijks Lesrooster', href: '/ons-aanbod/lesrooster' },
    ],
  },
  {
    label: 'Onze Sporten',
    href: '/sporten',
  },
  {
    label: 'Info',
    href: '#',
    children: [
      { label: 'Lidmaatschap & Proeflessen', href: '/info/lidmaatschap' },
      { label: 'Contributie', href: '/info/contributie' },
      { label: 'Organisatie', href: '/info/organisatie' },
      { label: 'Veilige Sportomgeving', href: '/info/veilige-sportomgeving' },
      { label: 'Kleding', href: '/info/kleding' },
      { label: 'Vacatures', href: '/info/vacatures' },
      { label: 'Dansstudio & Sportkantine', href: '/info/dansstudio-hengelo-en-de-sportkantine' },
      { label: 'Veelgestelde Vragen', href: '/info/faq' },
      { label: 'Geschiedenis', href: '/info/geschiedenis' },
      { label: 'Vakantierooster', href: '/info/vakantierooster' },
    ],
  },
  {
    label: 'Contact',
    href: '/contact',
  },
];

export const quickLinks = [
  { label: 'Lid Worden', href: '/info/lidmaatschap', highlight: true },
  { label: 'Lesrooster', href: '/ons-aanbod/lesrooster' },
  { label: 'Contributie', href: '/info/contributie' },
];

export const socialLinks = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/HGVHengelo',
    icon: 'facebook',
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/sportvereniginghgv/',
    icon: 'instagram',
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@sportvereniginghgv',
    icon: 'music',
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/message/ISC5E3YA4UTRP1',
    icon: 'message-circle',
  },
];
