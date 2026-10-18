/** Minimal automatic identifier masking for public, anonymous survey comments.
 * This is not a guarantee of anonymity. Participants are instructed to avoid names
 * and unique details before submission; this removes common direct identifiers.
 */
export function publicSurveyText(value: string): string {
  return value
    .replace(/https?:\/\/[^\s<>]+/gi, '[lien masqué]')
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[email masqué]')
    .replace(/(?:^|[\s(])(?:\+?\d[\d .()/-]{7,}\d)(?=$|[\s),.!?])/gm, ' [numéro masqué]')
    .replace(/(^|[\s(])@[a-zA-Z0-9_.]{2,}/g, '$1[identifiant masqué]')
    .replace(/\b(?:whatsapp|snapchat|instagram|telegram)\s*:\s*\S+/gi, '[contact masqué]')
    .replace(/\s{3,}/g, '  ')
    .trim()
    .slice(0, 1600);
}
