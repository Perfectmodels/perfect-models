import { legacyDb } from './lib/legacyDataAdapter';

// Compatibilité temporaire des pages legacy : aucune connexion Firebase, uniquement Supabase/API PMM.
export const rtdb = legacyDb;
export const auth = { provider: 'supabase' } as const;
export default legacyDb;
