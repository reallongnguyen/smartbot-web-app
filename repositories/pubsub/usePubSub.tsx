import { useMemo } from 'react';
import Pubsub from '.';

let globalClient: Pubsub | undefined = undefined;

function usePubSub() {
  const client = useMemo(() => {
    if (!globalClient) {
      globalClient = new Pubsub();
    }

    return globalClient;
  }, []);

  return client;
}

export default usePubSub;
