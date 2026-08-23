// Legacy compatibility entrypoint.
// All runtime business data is now loaded through the server-backed /api/data layer.
export { useRealtimeDB as useDataStore } from './useRealtimeDB';
export type { AppData } from './useRealtimeDB';
