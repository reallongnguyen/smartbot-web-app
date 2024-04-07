'use client';

import usePubSub from '@/repositories/pubsub/usePubSub';
import { useEffect } from 'react';

function AppProvider() {
  const client = usePubSub();

  useEffect(() => {
    return () => {
      client.disconnect();
    };
  }, [client]);

  return <></>;
}

export default AppProvider;
