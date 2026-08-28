export function readCourseProgress(row: any): number {
  if (!row) return 0;
  if (row.completed_at) return 100;

  const value = row.progress;
  if (typeof value === 'number') return clamp(value);
  if (!value || typeof value !== 'object' || Array.isArray(value)) return 0;

  if (value.completed === true || value.isCompleted === true) return 100;
  for (const key of ['percent', 'progress', 'value']) {
    const candidate = Number(value[key]);
    if (Number.isFinite(candidate)) return clamp(candidate);
  }
  return 0;
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
