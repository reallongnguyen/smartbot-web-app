import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { createClient } from './supabase';
import { SupabaseClient } from '@supabase/supabase-js';

const SupabaseContext = createContext<SupabaseClient | null>(null);

export const SupabaseProvider = ({ children }: PropsWithChildren) => {
  const [client, setClient] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    const supaClient = createClient();
    setClient(supaClient);
  }, []);

  return (
    <SupabaseContext.Provider value={client}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const client = useContext(SupabaseContext);

  return client;
};
