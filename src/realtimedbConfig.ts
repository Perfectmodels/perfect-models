import { legacyDb } from './lib/legacyDataAdapter';

// Compatibilité temporaire des pages legacy : cette référence pointe vers Supabase/API PMM.
export const db = legacyDb;
export default legacyDb;
