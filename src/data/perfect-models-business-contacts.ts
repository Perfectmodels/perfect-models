export type BusinessContact = {
  id: string;
  name: string;
  email: string;
  category: string;
  usage: string;
  verification: 'verified-source' | 'to-verify';
};

/**
 * Initial professional prospect list.
 * RH/recruitment, nominative and personal Gmail addresses are intentionally excluded.
 * Contacts should be revalidated before high-volume campaigns.
 */
export const INITIAL_BUSINESS_CONTACTS: BusinessContact[] = [
  { id: 'bgfi-contact', name: 'BGFIBank Gabon', email: 'eqc@bgfi.com', category: 'Banque', usage: 'Contact professionnel à confirmer', verification: 'to-verify' },
  { id: 'afg-service', name: 'AFG Bank Gabon', email: 'serviceclient@afgbank.ga', category: 'Banque', usage: 'Contact général / service client', verification: 'to-verify' },
  { id: 'orabank-info', name: 'Orabank Gabon', email: 'info.gabon@orabank.net', category: 'Banque', usage: 'Contact général', verification: 'verified-source' },
  { id: 'ecobank-contact', name: 'Ecobank Gabon', email: 'ecobankga@ecobank.com', category: 'Banque', usage: 'Contact général', verification: 'to-verify' },
  { id: 'comilog-communication', name: 'COMILOG', email: 'communication@eramet-comilog.com', category: 'Industrie / RSE', usage: 'Communication / partenariat', verification: 'to-verify' },
  { id: 'sobraga-castel', name: 'SOBRAGA', email: 'sbga.contact@castel-afrique.com', category: 'Agroalimentaire', usage: 'Contact professionnel', verification: 'to-verify' },
  { id: 'moov-contact', name: 'Moov Africa Gabon', email: 'contact@moov-africa.ga', category: 'Télécoms', usage: 'Contact général', verification: 'to-verify' },
  { id: 'gabontelecom-webmaster', name: 'Gabon Telecom', email: 'webmaster@gabontelecom.ga', category: 'Télécoms', usage: 'Contact entreprise / digital', verification: 'to-verify' },
  { id: 'nsia-contact', name: 'NSIA Assurances Gabon', email: 'nsiagabon@groupensia.com', category: 'Assurance', usage: 'Contact général', verification: 'to-verify' },
  { id: 'sunu-iard', name: 'SUNU Assurances IARD Gabon', email: 'gabon.iard@sunu-group.com', category: 'Assurance', usage: 'Contact général', verification: 'to-verify' },
  { id: 'sunu-vie', name: 'SUNU Assurances Vie Gabon', email: 'gabon.vie@sunu-group.com', category: 'Assurance', usage: 'Contact général', verification: 'to-verify' },
  { id: 'rougier-communication', name: 'Rougier Gabon', email: 'communication@rougier.fr', category: 'Industrie / RSE', usage: 'Communication', verification: 'to-verify' },
  { id: 'gabon-mining-info', name: 'Société Équatoriale des Mines', email: 'info@gabonmining.com', category: 'Mines', usage: 'Contact général', verification: 'to-verify' },
  { id: 'ess-capital', name: 'ESS Capital', email: 'info@ess-capital.com', category: 'Finance', usage: 'Contact général', verification: 'to-verify' },
  { id: 'gciae', name: 'GCIAE', email: 'rh@gciae.com', category: 'Entreprise', usage: 'Exclu des campagnes commerciales — RH', verification: 'to-verify' },
  { id: 'sogafric-contact', name: 'Groupe SOGAFRIC', email: 'contact.rh@groupesogafric.com', category: 'Groupe', usage: 'Exclu des campagnes commerciales — RH', verification: 'to-verify' },
  { id: 'petrogabon', name: 'PetroGabon', email: 'ressources-humaines@petrogabon.com', category: 'Énergie', usage: 'Exclu des campagnes commerciales — RH', verification: 'to-verify' },
  { id: 'sogara-contact', name: 'SOGARA', email: 'service.rgc@sogara.com', category: 'Énergie', usage: 'Contact professionnel', verification: 'to-verify' },
  { id: 'hsd-info', name: 'HSD Gabon', email: 'gabon.info@hsd-melt.com', category: 'Industrie', usage: 'Contact général', verification: 'to-verify' },
  { id: 'foselev-info', name: 'FOSELEV Gabon', email: 'info@foselevgabon.com', category: 'Services industriels', usage: 'Contact général', verification: 'to-verify' },
  { id: 'socaba', name: 'SOCABA', email: 'socoba@socoba-edtpl.com', category: 'BTP / Industrie', usage: 'Contact général', verification: 'to-verify' },
  { id: 'oprag', name: 'OPRAG', email: 'info@oprag.ga', category: 'Transport / Port', usage: 'Contact général', verification: 'to-verify' },
  { id: 'hlbpremus', name: 'HLB Premus Gabon', email: 'contact@hlbpremus.com', category: 'Conseil', usage: 'Contact général', verification: 'to-verify' },
  { id: 'gabonsoft', name: 'Gabon Soft', email: 'contact@gabonsoft.ga', category: 'Technologie', usage: 'Contact général', verification: 'to-verify' },
  { id: 'vista-corporate', name: 'Vista Corporate', email: 'contact@vista-corporate.com', category: 'Conseil', usage: 'Contact général', verification: 'to-verify' },
  { id: 'afrijet', name: 'Afrijet Gabon', email: 'contact@afrijet.com', category: 'Transport aérien', usage: 'Contact général — à confirmer', verification: 'to-verify' },
  { id: 'batimat', name: 'Batimat Gabon', email: 'contact@groupebatimat.com', category: 'Distribution / BTP', usage: 'Contact général — à confirmer', verification: 'to-verify' },
  { id: 'hotel-bantu', name: 'Hôtel Bantu', email: 'dghotelbantugabon@gmail.com', category: 'Hôtellerie', usage: 'Direction hôtel — à confirmer', verification: 'to-verify' },
];
