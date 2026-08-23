import React, { createContext, useContext } from 'react';
import { useRealtimeDB as useDataStore, AppData } from '../hooks/useRealtimeDB';

interface DataContextType {
  data: AppData | null;
  saveData: (newData: AppData) => Promise<void>;
  isInitialized: boolean;
  addDocument: (path: string, item: any) => Promise<string | null>;
  updateDocument: (path: string, id: string, updates: any) => Promise<void>;
  deleteDocument: (path: string, id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode; initialData?: Partial<AppData> | null }> = ({ children, initialData }) => {
  const store = useDataStore(initialData);
  return <DataContext.Provider value={store}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
