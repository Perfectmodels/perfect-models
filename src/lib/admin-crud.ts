import { RESOURCE_DEFINITIONS, type CrudField, type ResourceName } from '@/lib/agency-resource-registry';
import { MODEL_ADMIN_FIELDS } from '@/lib/model-admin-fields';

export class CrudValidationError extends Error {
  constructor(message: string) { super(message); this.name = 'CrudValidationError'; }
}
type Mode = 'create' | 'update';
function isBlank(value: unknown) { return value === undefined || value === null || (typeof value === 'string' && value.trim() === ''); }
function parseJson(field: CrudField, value: unknown) {
  if (typeof value !== 'string') { if (typeof value === 'object' && value !== null) return value; throw new CrudValidationError(`${field.label} doit contenir un objet ou une liste JSON valide.`); }
  try { return JSON.parse(value); } catch { throw new CrudValidationError(`${field.label} contient un JSON invalide.`); }
}
function normalize(field: CrudField, value: unknown) {
  if (field.type === 'boolean') {
    if (typeof value === 'boolean') return value;
    if (value === 'true' || value === '1' || value === 1) return true;
    if (value === 'false' || value === '0' || value === 0) return false;
    throw new CrudValidationError(`${field.label} doit être activé ou désactivé.`);
  }
  if (field.type === 'number') {
    const parsed = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
    if (!Number.isFinite(parsed)) throw new CrudValidationError(`${field.label} doit être un nombre valide.`);
    if (field.min !== undefined && parsed < field.min) throw new CrudValidationError(`${field.label} doit être supérieur ou égal à ${field.min}.`);
    if (field.max !== undefined && parsed > field.max) throw new CrudValidationError(`${field.label} doit être inférieur ou égal à ${field.max}.`);
    return parsed;
  }
  if (field.type === 'json') return parseJson(field, value);
  if (field.type === 'tags') {
    if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
    return String(value).split(',').map((item) => item.trim()).filter(Boolean);
  }
  if (field.type === 'number-list') {
    const items = Array.isArray(value) ? value : String(value).split(','); const parsed = items.map(Number);
    if (parsed.some((item) => !Number.isFinite(item))) throw new CrudValidationError(`${field.label} doit contenir uniquement des nombres séparés par des virgules.`);
    return parsed;
  }
  const text = String(value).trim();
  if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) throw new CrudValidationError(`${field.label} n’est pas une adresse e-mail valide.`);
  if (field.type === 'url') { try { const url = new URL(text); if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Protocole invalide'); } catch { throw new CrudValidationError(`${field.label} doit être une URL complète commençant par http:// ou https://.`); } }
  return text;
}

export function sanitizeResourcePayload(resource: ResourceName, input: unknown, mode: Mode) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new CrudValidationError('Le formulaire envoyé est invalide.');
  const definition = RESOURCE_DEFINITIONS[resource];
  const fields = resource === 'models' ? MODEL_ADMIN_FIELDS : definition.fields;
  const source = input as Record<string, unknown>; const output: Record<string, unknown> = {};
  for (const field of fields) {
    if (mode === 'update' && field.createOnly) continue;
    const hasValue = Object.prototype.hasOwnProperty.call(source, field.name); const value = source[field.name];
    if (!hasValue || isBlank(value)) {
      if (mode === 'create' && field.required) throw new CrudValidationError(`${field.label} est obligatoire.`);
      if (mode === 'update' && hasValue) output[field.name] = null;
      continue;
    }
    output[field.name] = normalize(field, value);
  }
  if (mode === 'update') delete output[definition.primaryKey];
  if (Object.keys(output).length === 0) throw new CrudValidationError('Aucune modification valide à enregistrer.');
  return output;
}
