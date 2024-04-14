'use client';

import { AuthProvider } from '@/usecases/auth/AuthContext';
import { PubSubProvider } from '@/usecases/pubsub/PubSubContext';
import { SupabaseProvider } from '@/usecases/supabase/SupabaseContex';
import { PropsWithChildren } from 'react';

function AppProvider({ children }: PropsWithChildren) {
  return (
    <AuthProvider>
      <SupabaseProvider>
        <PubSubProvider>{children}</PubSubProvider>
      </SupabaseProvider>
    </AuthProvider>
  );
}

export default AppProvider;
