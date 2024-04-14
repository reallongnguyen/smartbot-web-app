'use client';

import { AuthProvider } from '@/usecases/auth/AuthContext';
import { PubSubProvider } from '@/usecases/pubsub/PubSubContext';
import { PropsWithChildren } from 'react';

function AppProvider({ children }: PropsWithChildren) {
  return (
    <AuthProvider>
      <PubSubProvider>{children}</PubSubProvider>
    </AuthProvider>
  );
}

export default AppProvider;
