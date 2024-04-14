import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import PubSub from './PubSub';
import { useAuthSession } from '../auth/AuthContext';

const PubSubContext = createContext<PubSub | null>(null);

export const PubSubProvider = function ({ children }: PropsWithChildren) {
  const authSession = useAuthSession();
  const [ps, setPs] = useState<PubSub | null>(null);

  useEffect(() => {
    if (!authSession || !authSession.mqttAccount) {
      return;
    }

    const client = new PubSub(authSession?.mqttAccount);
    setPs(client);

    const disconnect = () => {
      client.disconnect();
    };

    return () => {
      disconnect();
    };
  }, [authSession]);

  return <PubSubContext.Provider value={ps}>{children}</PubSubContext.Provider>;
};

function usePubSub() {
  const ps = useContext(PubSubContext);

  return { client: ps };
}

export default usePubSub;
